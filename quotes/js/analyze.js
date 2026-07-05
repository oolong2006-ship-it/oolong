/* ============================================================
   analyze.js — محرك التحليل والمقارنة
   - مطابقة الأصناف بين الموردين (تطبيع عربي + تشابه ضبابي)
   - مصفوفة المقارنة: أفضل سعر لكل صنف من جميع الموردين
   - ترتيب الموردين، السلة المثلى، الوفورات، والتوصيات
   ============================================================ */
(function () {
  'use strict';

  const MATCH_THRESHOLD = 0.62; // حد التشابه لاعتبار صنفين متطابقين

  // ---------- مطابقة الأصناف عبر الموردين ----------
  // يعيد قائمة أصناف موحدة: لكل صنف عروض من الموردين المتوفر لديهم
  function matchItems(quotes) {
    const groups = []; // { key, name, unit, offers: Map(quoteId -> item) }

    quotes.forEach((q) => {
      q.items.forEach((item) => {
        const norm = U.normalizeArabic(item.name);
        let best = null, bestScore = 0;
        for (const g of groups) {
          if (g.offers.has(q.id)) {
            // نسمح بمطابقة المجموعة فقط إن كانت المطابقة تامة تقريبًا
            // (لتجنب دمج صنفين مختلفين من نفس المورد)
            const s = U.similarity(g.name, item.name);
            if (s > 0.97 && s > bestScore) { best = g; bestScore = s; }
            continue;
          }
          const s = g.key === norm ? 1 : U.similarity(g.name, item.name);
          if (s >= MATCH_THRESHOLD && s > bestScore) { best = g; bestScore = s; }
        }
        if (best && !best.offers.has(q.id)) {
          best.offers.set(q.id, item);
          // اعتماد الاسم الأطول (الأكثر وصفًا) للمجموعة
          if (item.name.length > best.name.length) best.name = item.name;
          if (!best.unit && item.unit) best.unit = item.unit;
        } else if (!best) {
          groups.push({ key: norm, name: item.name, unit: item.unit || '', offers: new Map([[q.id, item]]) });
        }
        // إن كانت المجموعة الأنسب مأخوذة من نفس المورد نتجاهل (يبقى صنفًا مستقلًا)
        else if (best && best.offers.has(q.id)) {
          groups.push({ key: norm, name: item.name, unit: item.unit || '', offers: new Map([[q.id, item]]) });
        }
      });
    });

    return groups;
  }

  // ---------- التحليل الكامل ----------
  function analyze(quotes, opts) {
    const currency = (opts && opts.currency) || detectCurrency(quotes) || 'ر.س';
    const groups = matchItems(quotes);

    // كمية مرجعية لكل صنف: الأكثر تكرارًا ثم الأكبر (لمقارنة عادلة للسلة)
    const rows = groups.map((g) => {
      const offers = [...g.offers.entries()].map(([qid, item]) => ({ quoteId: qid, item }));
      const qtyCounts = new Map();
      offers.forEach((o) => qtyCounts.set(o.item.qty, (qtyCounts.get(o.item.qty) || 0) + 1));
      let refQty = offers[0].item.qty;
      let bestCount = 0;
      qtyCounts.forEach((c, q) => { if (c > bestCount || (c === bestCount && q > refQty)) { refQty = q; bestCount = c; } });

      const prices = offers.map((o) => o.item.unitPrice);
      const minPrice = Math.min(...prices);
      const maxPrice = Math.max(...prices);
      const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;
      const bestOffers = offers.filter((o) => o.item.unitPrice === minPrice);

      return {
        name: g.name,
        unit: g.unit,
        refQty,
        offers,               // جميع عروض الموردين لهذا الصنف
        minPrice, maxPrice, avgPrice,
        bestQuoteIds: bestOffers.map((o) => o.quoteId),
        spreadPct: minPrice > 0 ? ((maxPrice - minPrice) / minPrice) * 100 : 0,
        coverage: offers.length,
      };
    });

    // ترتيب: الأصناف المشتركة أولاً ثم حسب قيمة الصنف
    rows.sort((a, b) => b.coverage - a.coverage || (b.minPrice * b.refQty) - (a.minPrice * a.refQty));

    // ---------- إحصاءات الموردين ----------
    const supplierStats = quotes.map((q) => {
      let quotedTotal = 0;       // إجمالي عرضه كما ورد (بأسعاره وكمياته)
      q.items.forEach((it) => { quotedTotal += it.total != null ? it.total : it.qty * it.unitPrice; });

      let covered = 0, wins = 0, basketTotal = 0, deviationSum = 0, deviationCount = 0;
      rows.forEach((r) => {
        const offer = r.offers.find((o) => o.quoteId === q.id);
        if (!offer) return;
        covered++;
        basketTotal += offer.item.unitPrice * r.refQty;
        if (r.bestQuoteIds.includes(q.id)) wins++;
        if (r.minPrice > 0) { deviationSum += ((offer.item.unitPrice - r.minPrice) / r.minPrice) * 100; deviationCount++; }
      });

      return {
        quoteId: q.id,
        supplier: q.supplier,
        quotedTotal,
        declaredTotal: q.grandTotal,
        itemCount: q.items.length,
        covered,
        coveragePct: rows.length ? (covered / rows.length) * 100 : 0,
        wins,
        basketTotal,               // إجمالي سلته على الكميات المرجعية للأصناف المتوفرة لديه
        avgDeviationPct: deviationCount ? deviationSum / deviationCount : 0,
        fullCoverage: covered === rows.length,
      };
    });

    // أفضل مورد إجمالاً: من يغطي كل الأصناف بأقل إجمالي، وإلا فالأعلى تغطية ثم الأقل انحرافًا
    const fullCov = supplierStats.filter((s) => s.fullCoverage);
    let bestSupplier;
    if (fullCov.length) {
      bestSupplier = fullCov.reduce((a, b) => (a.basketTotal <= b.basketTotal ? a : b));
    } else {
      bestSupplier = [...supplierStats].sort((a, b) => b.coveragePct - a.coveragePct || a.avgDeviationPct - b.avgDeviationPct)[0];
    }

    // ---------- السلة المثلى: أفضل سعر لكل صنف ----------
    let optimalTotal = 0;
    const perSupplierShare = new Map(); // quoteId -> { total, items }
    rows.forEach((r) => {
      optimalTotal += r.minPrice * r.refQty;
      const winnerId = r.bestQuoteIds[0];
      if (!perSupplierShare.has(winnerId)) perSupplierShare.set(winnerId, { total: 0, items: 0 });
      const sh = perSupplierShare.get(winnerId);
      sh.total += r.minPrice * r.refQty;
      sh.items++;
    });

    const optimalShare = [...perSupplierShare.entries()].map(([qid, sh]) => ({
      quoteId: qid,
      supplier: (quotes.find((q) => q.id === qid) || {}).supplier || '—',
      total: sh.total,
      items: sh.items,
      pct: optimalTotal > 0 ? (sh.total / optimalTotal) * 100 : 0,
    })).sort((a, b) => b.total - a.total);

    // الوفر: مقارنة السلة المثلى بأفضل مورد واحد كامل التغطية
    const bestSingle = fullCov.length ? fullCov.reduce((a, b) => (a.basketTotal <= b.basketTotal ? a : b)) : null;
    const savings = bestSingle ? bestSingle.basketTotal - optimalTotal : null;
    const savingsPct = bestSingle && bestSingle.basketTotal > 0 ? (savings / bestSingle.basketTotal) * 100 : null;

    const analysis = {
      currency,
      rows,
      supplierStats: [...supplierStats].sort((a, b) => (b.fullCoverage - a.fullCoverage) || a.basketTotal - b.basketTotal),
      bestSupplier,
      bestSingle,
      optimalTotal,
      optimalShare,
      savings,
      savingsPct,
      sharedItems: rows.filter((r) => r.coverage === quotes.length).length,
      totalItems: rows.length,
      quotes,
    };
    analysis.recommendations = buildRecommendations(analysis);
    return analysis;
  }

  function detectCurrency(quotes) {
    for (const q of quotes) { if (q.currency) return q.currency; }
    return null;
  }

  // ---------- التوصيات النصية ----------
  function buildRecommendations(a) {
    const recs = [];
    const cur = a.currency;

    if (a.bestSupplier) {
      if (a.bestSupplier.fullCoverage) {
        recs.push({
          icon: '🏆',
          text: `أفضل مورد إجمالاً هو «${a.bestSupplier.supplier}» بإجمالي ${U.fmtMoney(a.bestSupplier.basketTotal, cur)} مع تغطية كاملة لجميع الأصناف (${a.totalItems} صنفًا) وفوزه بأفضل سعر في ${a.bestSupplier.wins} صنفًا.`,
        });
      } else {
        recs.push({
          icon: '🏆',
          text: `أعلى الموردين ملاءمة هو «${a.bestSupplier.supplier}» بتغطية ${U.fmtPct(a.bestSupplier.coveragePct)} من الأصناف — لا يوجد مورد واحد يغطي جميع الأصناف، لذا يُنصح بالتقسيم أو طلب استكمال العروض.`,
        });
      }
    }

    if (a.savings != null && a.savings > 0.005) {
      recs.push({
        icon: '💰',
        text: `تقسيم الترسية بأفضل سعر لكل صنف (السلة المثلى) يخفض الإجمالي إلى ${U.fmtMoney(a.optimalTotal, cur)} بدلاً من ${U.fmtMoney(a.bestSingle.basketTotal, cur)} لدى «${a.bestSingle.supplier}» — وفر متوقع ${U.fmtMoney(a.savings, cur)} (${U.fmtPct(a.savingsPct)}).`,
      });
    } else if (a.savings != null) {
      recs.push({
        icon: '✅',
        text: `الترسية الموحدة على «${a.bestSingle.supplier}» تحقق نفس تكلفة السلة المثلى تقريبًا — يُفضل التوريد من مورد واحد لتبسيط التعاقد والاستلام.`,
      });
    }

    // أصناف بفروق سعرية كبيرة
    const bigSpread = a.rows.filter((r) => r.coverage > 1 && r.spreadPct >= 25)
      .sort((x, y) => y.spreadPct - x.spreadPct).slice(0, 3);
    bigSpread.forEach((r) => {
      const winner = (a.quotes.find((q) => q.id === r.bestQuoteIds[0]) || {}).supplier || '—';
      recs.push({
        icon: '⚠️',
        text: `فرق سعري كبير (${U.fmtPct(r.spreadPct, 0)}) في صنف «${r.name}»: أفضل سعر ${U.fmtMoney(r.minPrice, cur)} لدى «${winner}» مقابل أعلى سعر ${U.fmtMoney(r.maxPrice, cur)} — يُنصح بالتفاوض مع الموردين الأعلى سعرًا.`,
      });
    });

    // أصناف لدى مورد واحد فقط
    const single = a.rows.filter((r) => r.coverage === 1);
    if (single.length && a.quotes.length > 1) {
      recs.push({
        icon: '📋',
        text: `${single.length} صنفًا ورد لدى مورد واحد فقط (لا يمكن مقارنته) — تحقق من تطابق مسميات الأصناف في خطوة المراجعة أو اطلب استكمال العروض الناقصة.`,
      });
    }

    // ملاحظات الشروط
    a.quotes.forEach((q) => {
      if (q.notes) recs.push({ icon: '📝', text: `شروط «${q.supplier}»: ${q.notes}` });
      if (q.vatIncluded === false) recs.push({ icon: '🧾', text: `أسعار «${q.supplier}» غير شاملة الضريبة — تأكد من توحيد أساس المقارنة قبل الترسية.` });
    });

    return recs;
  }

  window.Analyze = { analyze, matchItems, MATCH_THRESHOLD };
})();
