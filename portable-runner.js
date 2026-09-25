#!/usr/bin/env node
/*
TAHKIK Portable External Rerun
Runner: TAHKIK-PORTABLE-0.1
Suite: TAHKIK-BENCH-0.3
No Floot, OpenAI, network, npm package, or API access is required.
Run with Node.js 18+ in an environment controlled by the external actor.
Expected labels are included, so this is a reproducibility rerun, not a blind test.
Usage: node <this-file>.js [actor-id] [organization]
*/

const fs = require('node:fs');
const os = require('node:os');
const crypto = require('node:crypto');
const RUNNER_VERSION = "TAHKIK-PORTABLE-0.1";
const SUITE_VERSION = "TAHKIK-BENCH-0.3";
const ENGINE_SHA256 = "d29b8d6f9e90c8f1676f606621e2a55bd8a1315b0bb89a873671ae1b1d447e62";
const FIXTURE_SHA256 = "97398b538a4bb9bc3ed34f8b42d7eb7659ae49fb32e3b07555622963b9c53e9c";
const FIXTURES = [
  {
    "id": "stats-mean-pass",
    "category": "basic_stats",
    "claim": "The mean is 3.",
    "material": "values = [1,2,3,4,5]\nclaimed_mean = 3",
    "expected": "SUPPORTED"
  },
  {
    "id": "stats-median-reject",
    "category": "basic_stats",
    "claim": "The median is 9.",
    "material": "values = [1,3,4,8,9]\nclaimed_median = 9",
    "expected": "CONTRADICTED"
  },
  {
    "id": "stats-variance-pass",
    "category": "basic_stats",
    "claim": "The population variance is two thirds.",
    "material": "values = [1,2,3]\nclaimed_variance = 0.6666666666666666",
    "expected": "SUPPORTED"
  },
  {
    "id": "stats-sample-std-pass",
    "category": "basic_stats",
    "claim": "The sample standard deviation is 1.",
    "material": "values = [1,2,3]\nclaimed_sample_std = 1",
    "expected": "SUPPORTED"
  },
  {
    "id": "stats-range-reject",
    "category": "basic_stats",
    "claim": "The range is 5.",
    "material": "values = [2,4,8]\nclaimed_range = 5",
    "expected": "CONTRADICTED"
  },
  {
    "id": "ratio-percent-pass",
    "category": "ratio",
    "claim": "The percentage is 25.",
    "material": "numerator = 50\ndenominator = 200\nclaimed_percentage = 25",
    "expected": "SUPPORTED"
  },
  {
    "id": "ratio-reject",
    "category": "ratio",
    "claim": "The ratio is 3.",
    "material": "numerator = 10\ndenominator = 5\nclaimed_ratio = 3",
    "expected": "CONTRADICTED"
  },
  {
    "id": "ratio-change-pass",
    "category": "ratio",
    "claim": "The percentage change is 20.",
    "material": "old_value = 100\nnew_value = 120\nclaimed_percentage_change = 20",
    "expected": "SUPPORTED"
  },
  {
    "id": "paired-correlation-pass",
    "category": "paired_stats",
    "claim": "The correlation is 1.",
    "material": "x = [1,2,3,4]\ny = [2,4,6,8]\nclaimed_correlation = 1",
    "expected": "SUPPORTED"
  },
  {
    "id": "paired-slope-reject",
    "category": "paired_stats",
    "claim": "The slope is 3.",
    "material": "x = [1,2,3,4]\ny = [2,4,6,8]\nclaimed_slope = 3",
    "expected": "CONTRADICTED"
  },
  {
    "id": "paired-intercept-pass",
    "category": "paired_stats",
    "claim": "The intercept is 1.",
    "material": "x = [1,2,3,4]\ny = [3,5,7,9]\nclaimed_intercept = 1",
    "expected": "SUPPORTED"
  },
  {
    "id": "paired-r2-pass",
    "category": "paired_stats",
    "claim": "R squared is 1.",
    "material": "x = [1,2,3,4]\ny = [4,7,10,13]\nclaimed_r2 = 1",
    "expected": "SUPPORTED"
  },
  {
    "id": "repeat-abs-pass",
    "category": "repeatability",
    "claim": "The rerun is within tolerance.",
    "material": "reference = [10,20,30]\nrerun = [10.2,19.8,30.1]\ntolerance = 0.25",
    "expected": "SUPPORTED"
  },
  {
    "id": "repeat-abs-reject",
    "category": "repeatability",
    "claim": "The rerun is within tolerance.",
    "material": "reference = [10,20,30]\nrerun = [10.6,19.8,30.1]\ntolerance = 0.25",
    "expected": "CONTRADICTED"
  },
  {
    "id": "repeat-mape-pass",
    "category": "repeatability",
    "claim": "The MAPE is 1.",
    "material": "reference = [100,200]\nrerun = [101,198]\nclaimed_mape = 1",
    "expected": "SUPPORTED"
  },
  {
    "id": "repeat-csv-reject",
    "category": "repeatability",
    "claim": "The rerun is within a 1 percent tolerance.",
    "material": "reference,rerun\n100,102\n200,202\n300,306\ntolerance_pct = 1",
    "expected": "CONTRADICTED"
  },
  {
    "id": "group-diff-pass",
    "category": "two_group",
    "claim": "The mean difference is 2.",
    "material": "group_a = [1,2,3,4,5]\ngroup_b = [3,4,5,6,7]\nclaimed_mean_difference = 2",
    "expected": "SUPPORTED"
  },
  {
    "id": "group-d-reject",
    "category": "two_group",
    "claim": "Cohen's d is 2.",
    "material": "group_a = [1,2,3,4,5]\ngroup_b = [3,4,5,6,7]\nclaimed_cohens_d = 2",
    "expected": "CONTRADICTED"
  },
  {
    "id": "group-p-pass",
    "category": "two_group",
    "claim": "The p value is approximately 0.08051623795721286.",
    "material": "group_a = [1,2,3,4,5]\ngroup_b = [3,4,5,6,7]\nclaimed_p_value = 0.08051623795721286",
    "expected": "SUPPORTED"
  },
  {
    "id": "group-g-pass",
    "category": "two_group",
    "claim": "Hedges g matches the supplied value.",
    "material": "group_a = [1,2,3,4,5]\ngroup_b = [3,4,5,6,7]\nclaimed_hedges_g = 1.1425003159318015",
    "expected": "SUPPORTED"
  },
  {
    "id": "unsupported-qualitative",
    "category": "boundary",
    "claim": "This treatment feels better.",
    "material": "Participants described mixed impressions.",
    "expected": "NOT_HANDLED"
  },
  {
    "id": "unsupported-code",
    "category": "boundary",
    "claim": "This code is memory safe.",
    "material": "function f(x) { return x + 1; }",
    "expected": "NOT_HANDLED"
  },
  {
    "id": "unsupported-single-value",
    "category": "boundary",
    "claim": "The mean is 5.",
    "material": "values = [5]",
    "expected": "NOT_HANDLED"
  },
  {
    "id": "unsupported-zero-variance-groups",
    "category": "boundary",
    "claim": "The group difference is significant.",
    "material": "group_a = [1,1,1]\ngroup_b = [2,2,2]",
    "expected": "NOT_HANDLED"
  },
  {
    "id": "adv-negative-mean-pass",
    "category": "adversarial_numeric",
    "claim": "The mean is 0.",
    "material": "values = [-2,-1,0,1,2]\nclaimed_mean = 0",
    "expected": "SUPPORTED"
  },
  {
    "id": "adv-decimal-median-pass",
    "category": "adversarial_numeric",
    "claim": "The median is 0.25.",
    "material": "values = [-1.5,0,0.5,4]\nclaimed_median = 0.25",
    "expected": "SUPPORTED"
  },
  {
    "id": "adv-zero-denominator",
    "category": "adversarial_numeric",
    "claim": "The ratio is 2.",
    "material": "numerator = 10\ndenominator = 0\nclaimed_ratio = 2",
    "expected": "NOT_HANDLED"
  },
  {
    "id": "adv-negative-change-pass",
    "category": "adversarial_numeric",
    "claim": "The percentage change is -20.",
    "material": "old_value = 100\nnew_value = 80\nclaimed_percentage_change = -20",
    "expected": "SUPPORTED"
  },
  {
    "id": "adv-negative-correlation-pass",
    "category": "adversarial_numeric",
    "claim": "The correlation is -1.",
    "material": "x = [1,2,3,4]\ny = [8,6,4,2]\nclaimed_correlation = -1",
    "expected": "SUPPORTED"
  },
  {
    "id": "adv-zero-variance-x",
    "category": "adversarial_numeric",
    "claim": "The slope is 1.",
    "material": "x = [2,2,2,2]\ny = [1,2,3,4]\nclaimed_slope = 1",
    "expected": "NOT_HANDLED"
  },
  {
    "id": "adv-repeat-mismatched-lengths",
    "category": "adversarial_repeatability",
    "claim": "The rerun is reproducible.",
    "material": "reference = [1,2,3]\nrerun = [1,2]",
    "expected": "NOT_HANDLED"
  },
  {
    "id": "adv-repeat-exact-zero-tolerance",
    "category": "adversarial_repeatability",
    "claim": "The rerun is within zero tolerance.",
    "material": "reference = [1,2,3]\nrerun = [1,2,3]\ntolerance = 0",
    "expected": "SUPPORTED"
  },
  {
    "id": "adv-two-group-unequal-n-pass",
    "category": "adversarial_two_group",
    "claim": "The mean difference is 3.",
    "material": "group_a = [1,2,3]\ngroup_b = [3,4,5,6,7]\nclaimed_mean_difference = 3",
    "expected": "SUPPORTED"
  },
  {
    "id": "adv-two-group-wrong-p",
    "category": "adversarial_two_group",
    "claim": "The p value is 0.5.",
    "material": "group_a = [1,2,3,4,5]\ngroup_b = [3,4,5,6,7]\nclaimed_p_value = 0.5",
    "expected": "CONTRADICTED"
  },
  {
    "id": "adv-nan-list",
    "category": "parser_safety",
    "claim": "The mean is 2.",
    "material": "values = [1,NaN,3]\nclaimed_mean = 2",
    "expected": "NOT_HANDLED"
  },
  {
    "id": "adv-infinity-list",
    "category": "parser_safety",
    "claim": "The mean is 2.",
    "material": "values = [1,Infinity,3]\nclaimed_mean = 2",
    "expected": "NOT_HANDLED"
  },
  {
    "id": "adv-malformed-paired-token",
    "category": "parser_safety",
    "claim": "The correlation is 1.",
    "material": "x = [1,2,bad,4]\ny = [2,4,6,8]\nclaimed_correlation = 1",
    "expected": "NOT_HANDLED"
  },
  {
    "id": "adv-malformed-repeat-csv-row",
    "category": "parser_safety",
    "claim": "The rerun is within tolerance.",
    "material": "reference,rerun\n10,10.1\nbad,20\n30,30.1\ntolerance = 0.2",
    "expected": "NOT_HANDLED"
  },
  {
    "id": "adv-missing-claim-target",
    "category": "boundary",
    "claim": "These values are interesting.",
    "material": "values = [1,2,3,4]",
    "expected": "NOT_HANDLED"
  },
  {
    "id": "adv-narrative-with-numbers",
    "category": "boundary",
    "claim": "The study mentions 3 groups.",
    "material": "There were 3 groups and 20 participants in total.",
    "expected": "NOT_HANDLED"
  },
  {
    "id": "adv-large-magnitude-mean-pass",
    "category": "numeric_stress",
    "claim": "The mean is 1000000002.",
    "material": "values = [1000000000,1000000002,1000000004]\nclaimed_mean = 1000000002",
    "expected": "SUPPORTED"
  },
  {
    "id": "adv-duplicate-median-pass",
    "category": "numeric_stress",
    "claim": "The median is 1.",
    "material": "values = [1,1,1,9,9]\nclaimed_median = 1",
    "expected": "SUPPORTED"
  },
  {
    "id": "adv-multi-claim-one-wrong",
    "category": "numeric_stress",
    "claim": "The supplied summary statistics are correct.",
    "material": "values = [1,2,3]\nclaimed_mean = 2\nclaimed_sum = 7",
    "expected": "CONTRADICTED"
  },
  {
    "id": "adv-turkish-claim-mean-pass",
    "category": "numeric_stress",
    "claim": "Ortalama 2.",
    "material": "values = [1,2,3]",
    "expected": "SUPPORTED"
  },
  {
    "id": "adv-negative-denominator-ratio-pass",
    "category": "ratio_stress",
    "claim": "The ratio is -2.",
    "material": "numerator = 10\ndenominator = -5\nclaimed_ratio = -2",
    "expected": "SUPPORTED"
  },
  {
    "id": "adv-small-denominator-ratio-pass",
    "category": "ratio_stress",
    "claim": "The ratio is 1000000.",
    "material": "numerator = 1\ndenominator = 0.000001\nclaimed_ratio = 1000000",
    "expected": "SUPPORTED"
  },
  {
    "id": "adv-missing-denominator",
    "category": "ratio_stress",
    "claim": "The ratio is 5.",
    "material": "numerator = 5\nclaimed_ratio = 5",
    "expected": "NOT_HANDLED"
  },
  {
    "id": "adv-negative-old-change-pass",
    "category": "ratio_stress",
    "claim": "The percentage change is 20.",
    "material": "old_value = -100\nnew_value = -80\nclaimed_percentage_change = 20",
    "expected": "SUPPORTED"
  },
  {
    "id": "adv-paired-affine-pass",
    "category": "paired_stress",
    "claim": "The linear relationship is reproduced.",
    "material": "x = [0,1,2,3]\ny = [1,3,5,7]\nclaimed_slope = 2\nclaimed_intercept = 1\nclaimed_r2 = 1",
    "expected": "SUPPORTED"
  },
  {
    "id": "adv-paired-length-mismatch",
    "category": "paired_stress",
    "claim": "The slope is 2.",
    "material": "x = [1,2,3]\ny = [2,4]\nclaimed_slope = 2",
    "expected": "NOT_HANDLED"
  },
  {
    "id": "adv-paired-zero-variance-y",
    "category": "paired_stress",
    "claim": "The correlation is 0.",
    "material": "x = [1,2,3]\ny = [4,4,4]\nclaimed_correlation = 0",
    "expected": "NOT_HANDLED"
  },
  {
    "id": "adv-repeat-negative-tolerance",
    "category": "repeatability_safety",
    "claim": "The rerun is within tolerance.",
    "material": "reference = [1,2]\nrerun = [1,2]\ntolerance = -1",
    "expected": "NOT_HANDLED"
  },
  {
    "id": "adv-repeat-zero-reference-percent",
    "category": "repeatability_safety",
    "claim": "The rerun is within zero percent tolerance.",
    "material": "reference = [0,100]\nrerun = [10,100]\ntolerance_pct = 0",
    "expected": "NOT_HANDLED"
  },
  {
    "id": "adv-repeat-malformed-list",
    "category": "repeatability_safety",
    "claim": "The rerun is within tolerance.",
    "material": "reference = [1,2,bad]\nrerun = [1,2,3]\ntolerance = 0",
    "expected": "NOT_HANDLED"
  },
  {
    "id": "adv-repeat-extra-column-csv-pass",
    "category": "repeatability_safety",
    "claim": "The rerun is within tolerance.",
    "material": "reference,rerun,note\n10,10.1,a\n20,19.9,b\n30,30.1,c\ntolerance = 0.2",
    "expected": "SUPPORTED"
  },
  {
    "id": "adv-two-group-negative-diff-pass",
    "category": "two_group_stress",
    "claim": "The mean difference is -3.",
    "material": "group_a = [5,6,7]\ngroup_b = [2,3,4]\nclaimed_mean_difference = -3",
    "expected": "SUPPORTED"
  },
  {
    "id": "adv-two-group-small-n-pass",
    "category": "two_group_stress",
    "claim": "The mean difference is 1.",
    "material": "group_a = [1,3]\ngroup_b = [2,4]\nclaimed_mean_difference = 1",
    "expected": "SUPPORTED"
  },
  {
    "id": "adv-two-group-malformed-token",
    "category": "two_group_stress",
    "claim": "The mean difference is 3.",
    "material": "group_a = [1,2,bad]\ngroup_b = [3,4,5]\nclaimed_mean_difference = 3",
    "expected": "NOT_HANDLED"
  },
  {
    "id": "adv-two-group-singleton",
    "category": "two_group_stress",
    "claim": "The mean difference is 1.",
    "material": "group_a = [1]\ngroup_b = [2,3]\nclaimed_mean_difference = 1",
    "expected": "NOT_HANDLED"
  },
  {
    "id": "adv-duplicate-values-assignment",
    "category": "ambiguity_safety",
    "claim": "The mean is 2.",
    "material": "values = [1,2,3]\nvalues = [100,200,300]\nclaimed_mean = 2",
    "expected": "NOT_HANDLED"
  },
  {
    "id": "adv-duplicate-numerator-assignment",
    "category": "ambiguity_safety",
    "claim": "The ratio is 2.",
    "material": "numerator = 10\nnumerator = 20\ndenominator = 5\nclaimed_ratio = 2",
    "expected": "NOT_HANDLED"
  },
  {
    "id": "adv-duplicate-reference-assignment",
    "category": "ambiguity_safety",
    "claim": "The rerun is within tolerance.",
    "material": "reference = [1,2,3]\nreference = [4,5,6]\nrerun = [1,2,3]\ntolerance = 0",
    "expected": "NOT_HANDLED"
  },
  {
    "id": "adv-scientific-notation-list",
    "category": "numeric_stress",
    "claim": "The mean is 2000.",
    "material": "values = [1e3,2e3,3e3]\nclaimed_mean = 2000",
    "expected": "SUPPORTED"
  },
  {
    "id": "adv-leading-decimal-list",
    "category": "numeric_stress",
    "claim": "The mean is 1.5.",
    "material": "values = [.5,1.5,2.5]\nclaimed_mean = 1.5",
    "expected": "SUPPORTED"
  }
];

const portableDeterministicCheck = function portableDeterministicCheck(claim, material) {
  function near(a, b) {
    const scale = Math.max(1, Math.abs(a), Math.abs(b));
    return Math.abs(a - b) <= 1e-9 * scale;
  }
  function scalar(key) {
    const matches = [
      ...material.matchAll(
        new RegExp(
          "(?:^|\\n)\\s*" + key + "\\s*=\\s*(-?\\d+(?:\\.\\d+)?(?:e[-+]?\\d+)?)",
          "gi"
        )
      )
    ];
    if (matches.length !== 1) return null;
    const value = Number(matches[0][1]);
    return Number.isFinite(value) ? value : null;
  }
  function claimed(key) {
    const matches = [
      ...material.matchAll(
        new RegExp(
          "claimed_" + key + "\\s*=\\s*(-?\\d+(?:\\.\\d+)?(?:e[-+]?\\d+)?)",
          "gi"
        )
      )
    ];
    if (matches.length !== 1) return null;
    const value = Number(matches[0][1]);
    return Number.isFinite(value) ? value : null;
  }
  function list(key) {
    const matches = [
      ...material.matchAll(
        new RegExp("(?:^|\\n)\\s*" + key + "\\s*=\\s*\\[([^\\]]+)\\]", "gi")
      )
    ];
    if (matches.length !== 1) return null;
    const tokens = matches[0][1].split(",").map((value) => value.trim());
    if (tokens.length < 2) return null;
    const values2 = tokens.map(Number);
    return values2.every(Number.isFinite) ? values2 : null;
  }
  function csv(leftNames, rightNames) {
    const lines = material.split(/\r?\n/).map((line) => line.trim()).filter(Boolean).filter((line) => !/^(FILE|TYPE):/i.test(line));
    if (lines.length < 3) return null;
    const sep = lines[0].includes("	") ? "	" : lines[0].includes(";") ? ";" : ",";
    const headers = lines[0].split(sep).map((value) => value.trim().toLowerCase());
    const li = headers.findIndex((header) => leftNames.includes(header));
    const ri = headers.findIndex((header) => rightNames.includes(header));
    if (li < 0 || ri < 0) return null;
    const left = [];
    const right = [];
    for (const line of lines.slice(1)) {
      if (line.includes("=") && !line.includes(sep)) continue;
      const cells = line.split(sep).map((value) => value.trim());
      if (cells.length <= Math.max(li, ri)) return null;
      const a = Number(cells[li]);
      const b = Number(cells[ri]);
      if (!Number.isFinite(a) || !Number.isFinite(b)) return null;
      left.push(a);
      right.push(b);
    }
    return left.length >= 2 && left.length === right.length ? { left, right } : null;
  }
  function median(values2) {
    const sorted = [...values2].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
  }
  function genericValues() {
    const matches = [
      ...material.matchAll(/(?:^|\n)\s*values?\s*=\s*\[([^\]]+)\]/gi)
    ];
    if (matches.length > 1) return null;
    if (matches[0]) {
      const tokens = matches[0][1].split(",").map((value) => value.trim());
      if (tokens.length < 2) return null;
      const values2 = tokens.map(Number);
      return values2.every(Number.isFinite) ? values2 : null;
    }
    const specialized = /(?:^|\n)\s*(?:x|y|group_a|group_b|control|treatment|before|after|reference|baseline|expected|rerun|repeat|observed|numerator|denominator|old_value|new_value)\s*=/im.test(
      material
    );
    if (specialized) return null;
    return null;
  }
  function logGamma(z) {
    const coeff = [
      676.5203681218851,
      -1259.1392167224028,
      771.3234287776531,
      -176.6150291621406,
      12.507343278686905,
      -0.13857109526572012,
      9984369578019572e-21,
      15056327351493116e-23
    ];
    if (z < 0.5) {
      return Math.log(Math.PI) - Math.log(Math.sin(Math.PI * z)) - logGamma(1 - z);
    }
    z -= 1;
    let x2 = 0.9999999999998099;
    for (let i = 0; i < coeff.length; i++) x2 += coeff[i] / (z + i + 1);
    const t = z + coeff.length - 0.5;
    return 0.5 * Math.log(2 * Math.PI) + (z + 0.5) * Math.log(t) - t + Math.log(x2);
  }
  function betaCf(a, b, x2) {
    const maxIter = 200;
    const eps = 3e-12;
    const fpmin = 1e-300;
    const qab = a + b;
    const qap = a + 1;
    const qam = a - 1;
    let c = 1;
    let d = 1 - qab * x2 / qap;
    if (Math.abs(d) < fpmin) d = fpmin;
    d = 1 / d;
    let h = d;
    for (let m = 1; m <= maxIter; m++) {
      const m2 = 2 * m;
      let aa = m * (b - m) * x2 / ((qam + m2) * (a + m2));
      d = 1 + aa * d;
      if (Math.abs(d) < fpmin) d = fpmin;
      c = 1 + aa / c;
      if (Math.abs(c) < fpmin) c = fpmin;
      d = 1 / d;
      h *= d * c;
      aa = -((a + m) * (qab + m) * x2) / ((a + m2) * (qap + m2));
      d = 1 + aa * d;
      if (Math.abs(d) < fpmin) d = fpmin;
      c = 1 + aa / c;
      if (Math.abs(c) < fpmin) c = fpmin;
      d = 1 / d;
      const delta = d * c;
      h *= delta;
      if (Math.abs(delta - 1) < eps) break;
    }
    return h;
  }
  function ibeta(x2, a, b) {
    if (x2 <= 0) return 0;
    if (x2 >= 1) return 1;
    const bt = Math.exp(
      logGamma(a + b) - logGamma(a) - logGamma(b) + a * Math.log(x2) + b * Math.log(1 - x2)
    );
    if (x2 < (a + 1) / (a + b + 2)) return bt * betaCf(a, b, x2) / a;
    return 1 - bt * betaCf(b, a, 1 - x2) / b;
  }
  function tCdf(t, df) {
    if (!Number.isFinite(t) || !Number.isFinite(df) || df <= 0) return NaN;
    if (t === 0) return 0.5;
    const x2 = df / (df + t * t);
    const ib = ibeta(x2, df / 2, 0.5);
    return t > 0 ? 1 - 0.5 * ib : 0.5 * ib;
  }
  let groupA = list("group_a") ?? list("control") ?? list("before");
  let groupB = list("group_b") ?? list("treatment") ?? list("after");
  if (!groupA || !groupB) {
    const parsed = csv(
      ["group_a", "control", "before"],
      ["group_b", "treatment", "after"]
    );
    groupA = parsed?.left ?? null;
    groupB = parsed?.right ?? null;
  }
  if (groupA && groupB) {
    if (groupA.length < 2 || groupB.length < 2) return "NOT_HANDLED";
    const nA = groupA.length;
    const nB = groupB.length;
    const meanA = groupA.reduce((a, b) => a + b, 0) / nA;
    const meanB = groupB.reduce((a, b) => a + b, 0) / nB;
    const varA = groupA.reduce((acc, value) => acc + (value - meanA) ** 2, 0) / (nA - 1);
    const varB = groupB.reduce((acc, value) => acc + (value - meanB) ** 2, 0) / (nB - 1);
    const diff = meanB - meanA;
    const se2 = varA / nA + varB / nB;
    if (se2 <= 0) return "NOT_HANDLED";
    const se = Math.sqrt(se2);
    const t = diff / se;
    const df = se2 * se2 / (varA * varA / (nA * nA * (nA - 1)) + varB * varB / (nB * nB * (nB - 1)));
    const p = Math.max(0, Math.min(1, 2 * (1 - tCdf(Math.abs(t), df))));
    const pooledDen = nA + nB - 2;
    const pooledSd = pooledDen > 0 ? Math.sqrt(((nA - 1) * varA + (nB - 1) * varB) / pooledDen) : 0;
    const d = pooledSd > 0 ? diff / pooledSd : 0;
    const correction = pooledDen > 1 ? 1 - 3 / (4 * pooledDen - 1) : 1;
    const g = d * correction;
    const expected2 = [
      [claimed("mean_difference"), diff],
      [claimed("cohens_d"), d],
      [claimed("hedges_g"), g],
      [claimed("p_value"), p]
    ];
    const present2 = expected2.filter(([target3]) => target3 !== null);
    if (present2.length) {
      return present2.some(([target3, actual3]) => target3 !== null && !near(target3, actual3)) ? "CONTRADICTED" : "SUPPORTED";
    }
    const lower2 = claim.toLowerCase();
    const match2 = claim.match(/(-?\d+(?:\.\d+)?)/);
    if (!match2) return "NOT_HANDLED";
    const target2 = Number(match2[1]);
    const actual2 = lower2.includes("mean difference") || lower2.includes("ortalama fark") ? diff : lower2.includes("cohen") ? d : lower2.includes("hedges") ? g : lower2.includes("p value") || lower2.includes("p-value") || lower2.includes("p de\u011Feri") ? p : NaN;
    if (!Number.isFinite(actual2)) return "NOT_HANDLED";
    return near(target2, actual2) ? "SUPPORTED" : "CONTRADICTED";
  }
  let reference = list("reference") ?? list("baseline") ?? list("expected");
  let rerun = list("rerun") ?? list("repeat") ?? list("observed");
  if (!reference || !rerun) {
    const parsed = csv(
      ["reference", "baseline", "expected"],
      ["rerun", "repeat", "observed"]
    );
    reference = parsed?.left ?? null;
    rerun = parsed?.right ?? null;
  }
  if (reference || rerun) {
    if (!reference || !rerun || reference.length !== rerun.length || reference.length < 2) {
      return "NOT_HANDLED";
    }
    const toleranceAbs = scalar("tolerance") ?? scalar("tolerance_abs");
    const tolerancePct = scalar("tolerance_pct");
    const cMae = claimed("mae");
    const cRmse = claimed("rmse");
    const cMax = claimed("max_error");
    const cMape = claimed("mape");
    if (toleranceAbs !== null && toleranceAbs < 0 || tolerancePct !== null && tolerancePct < 0) {
      return "NOT_HANDLED";
    }
    if ((tolerancePct !== null || cMape !== null) && reference.some((value) => Math.abs(value) <= 1e-12)) {
      return "NOT_HANDLED";
    }
    const errors = reference.map((value, index) => rerun[index] - value);
    const abs = errors.map(Math.abs);
    const mae = abs.reduce((a, b) => a + b, 0) / abs.length;
    const rmse = Math.sqrt(errors.reduce((acc, value) => acc + value * value, 0) / errors.length);
    const max2 = Math.max(...abs);
    const mape = reference.reduce((acc, value, index) => acc + abs[index] / Math.abs(value), 0) / reference.length * 100;
    let mismatch = false;
    for (const [target2, actual2] of [
      [cMae, mae],
      [cRmse, rmse],
      [cMax, max2],
      [cMape, mape]
    ]) {
      if (target2 !== null && !near(target2, actual2)) mismatch = true;
    }
    if (toleranceAbs !== null && max2 > toleranceAbs) mismatch = true;
    if (tolerancePct !== null && mape > tolerancePct) mismatch = true;
    if (cMae === null && cRmse === null && cMax === null && cMape === null && toleranceAbs === null && tolerancePct === null) {
      const lower2 = claim.toLowerCase();
      if (!(lower2.includes("repro") || lower2.includes("repeat") || lower2.includes("rerun") || lower2.includes("tekrar") || lower2.includes("yeniden"))) {
        return "NOT_HANDLED";
      }
    }
    return mismatch ? "CONTRADICTED" : "SUPPORTED";
  }
  const x = list("x");
  const y = list("y");
  if (x || y) {
    if (!x || !y || x.length !== y.length || x.length < 2) return "NOT_HANDLED";
    const meanX = x.reduce((a, b) => a + b, 0) / x.length;
    const meanY = y.reduce((a, b) => a + b, 0) / y.length;
    const sxx = x.reduce((acc, value) => acc + (value - meanX) ** 2, 0);
    const syy = y.reduce((acc, value) => acc + (value - meanY) ** 2, 0);
    const sxy = x.reduce((acc, value, index) => acc + (value - meanX) * (y[index] - meanY), 0);
    if (sxx === 0 || syy === 0) return "NOT_HANDLED";
    const correlation = sxy / Math.sqrt(sxx * syy);
    const slope = sxy / sxx;
    const intercept = meanY - slope * meanX;
    const r2 = correlation * correlation;
    const expected2 = [
      [claimed("correlation"), correlation],
      [claimed("slope"), slope],
      [claimed("intercept"), intercept],
      [claimed("r2"), r2]
    ];
    const present2 = expected2.filter(([target3]) => target3 !== null);
    if (present2.length) {
      return present2.some(([target3, actual3]) => target3 !== null && !near(target3, actual3)) ? "CONTRADICTED" : "SUPPORTED";
    }
    const lower2 = claim.toLowerCase();
    const match2 = claim.match(/(-?\d+(?:\.\d+)?)/);
    if (!match2) return "NOT_HANDLED";
    const target2 = Number(match2[1]);
    const actual2 = lower2.includes("correlation") || lower2.includes("korelasyon") ? correlation : lower2.includes("slope") || lower2.includes("e\u011Fim") ? slope : lower2.includes("intercept") || lower2.includes("sabit") ? intercept : lower2.includes("r2") || lower2.includes("r\xB2") ? r2 : NaN;
    if (!Number.isFinite(actual2)) return "NOT_HANDLED";
    return near(target2, actual2) ? "SUPPORTED" : "CONTRADICTED";
  }
  const numerator = scalar("numerator");
  const denominator = scalar("denominator");
  const oldValue = scalar("old_value");
  const newValue = scalar("new_value");
  const cRatio = claimed("ratio");
  const cPct = claimed("percentage");
  const cChange = claimed("percentage_change");
  if (numerator !== null || denominator !== null || oldValue !== null || newValue !== null) {
    let actual2 = null;
    let target2 = null;
    if (numerator !== null && denominator !== null && denominator !== 0) {
      if (cPct !== null) {
        actual2 = numerator / denominator * 100;
        target2 = cPct;
      } else if (cRatio !== null) {
        actual2 = numerator / denominator;
        target2 = cRatio;
      }
    }
    if (actual2 === null && oldValue !== null && newValue !== null && oldValue !== 0 && cChange !== null) {
      actual2 = (newValue - oldValue) / Math.abs(oldValue) * 100;
      target2 = cChange;
    }
    if (actual2 === null || target2 === null) {
      const lower2 = claim.toLowerCase();
      const match2 = claim.match(/(-?\d+(?:\.\d+)?)/);
      if (!match2) return "NOT_HANDLED";
      const value = Number(match2[1]);
      if (numerator !== null && denominator !== null && denominator !== 0 && (lower2.includes("percent") || lower2.includes("y\xFCzde") || lower2.includes("%"))) {
        actual2 = numerator / denominator * 100;
        target2 = value;
      } else if (numerator !== null && denominator !== null && denominator !== 0 && (lower2.includes("ratio") || lower2.includes("oran"))) {
        actual2 = numerator / denominator;
        target2 = value;
      } else {
        return "NOT_HANDLED";
      }
    }
    return near(target2, actual2) ? "SUPPORTED" : "CONTRADICTED";
  }
  const values = genericValues();
  if (!values) return "NOT_HANDLED";
  const sum = values.reduce((a, b) => a + b, 0);
  const mean = sum / values.length;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const med = median(values);
  const range = max - min;
  const variance = values.reduce((acc, value) => acc + (value - mean) ** 2, 0) / values.length;
  const std = Math.sqrt(variance);
  const sampleVariance = values.reduce((acc, value) => acc + (value - mean) ** 2, 0) / (values.length - 1);
  const sampleStd = Math.sqrt(sampleVariance);
  const expected = [
    [claimed("mean"), mean],
    [claimed("sum"), sum],
    [claimed("count"), values.length],
    [claimed("min"), min],
    [claimed("max"), max],
    [claimed("median"), med],
    [claimed("range"), range],
    [claimed("variance"), variance],
    [claimed("std"), std],
    [claimed("sample_variance"), sampleVariance],
    [claimed("sample_std"), sampleStd]
  ];
  const present = expected.filter(([target2]) => target2 !== null);
  if (present.length) {
    return present.some(([target2, actual2]) => target2 !== null && !near(target2, actual2)) ? "CONTRADICTED" : "SUPPORTED";
  }
  const lower = claim.toLowerCase();
  const match = claim.match(/(-?\d+(?:\.\d+)?)/);
  if (!match) return "NOT_HANDLED";
  const target = Number(match[1]);
  const actual = lower.includes("mean") || lower.includes("average") || lower.includes("ortalama") ? mean : lower.includes("median") || lower.includes("medyan") ? med : lower.includes("variance") || lower.includes("varyans") ? variance : lower.includes("standard deviation") || lower.includes("std") || lower.includes("standart sapma") ? std : lower.includes("range") || lower.includes("aral\u0131k") ? range : lower.includes("sum") || lower.includes("toplam") ? sum : lower.includes("count") || lower.includes("adet") ? values.length : lower.includes("min") ? min : lower.includes("max") ? max : NaN;
  if (!Number.isFinite(actual)) return "NOT_HANDLED";
  return near(target, actual) ? "SUPPORTED" : "CONTRADICTED";
};

function stable(value) {
  if (Array.isArray(value)) return value.map(stable);
  if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).sort(([a],[b]) => a.localeCompare(b)).map(([k,v]) => [k,stable(v)]));
  return value;
}
function digest(value) { return crypto.createHash('sha256').update(typeof value === 'string' ? value : JSON.stringify(stable(value))).digest('hex'); }

const fixtureHashNow = digest(FIXTURES);
if (fixtureHashNow !== FIXTURE_SHA256) {
  console.error('Fixture integrity failure. Expected ' + FIXTURE_SHA256 + ' but got ' + fixtureHashNow);
  process.exit(2);
}
const startedAt = new Date().toISOString();
const cases = FIXTURES.map((fixture) => {
  const actual = portableDeterministicCheck(fixture.claim, fixture.material);
  return { id: fixture.id, category: fixture.category, expected: fixture.expected, actual, passed: actual === fixture.expected };
});
const passedCases = cases.filter((item) => item.passed).length;
const unsafeHandledCount = cases.filter((item) => item.expected === 'NOT_HANDLED' && item.actual !== 'NOT_HANDLED').length;
const finishedAt = new Date().toISOString();
const report = {
  reportVersion: 'TAHKIK-EXTERNAL-RERUN-REPORT-0.1',
  runnerVersion: RUNNER_VERSION,
  suiteVersion: SUITE_VERSION,
  engineSha256: ENGINE_SHA256,
  fixtureSha256: FIXTURE_SHA256,
  actorNameOrId: process.argv[2] || '',
  organization: process.argv[3] || '',
  environment: { platform: process.platform, arch: process.arch, node: process.version, osType: os.type(), osRelease: os.release() },
  startedAt, finishedAt,
  resultSummary: { totalCases: cases.length, passedCases, failedCases: cases.length - passedCases, unsafeHandledCount },
  cases,
  declaration: 'Executed in an environment controlled by the external actor using the frozen portable runner without modifying its fixtures.'
};
const reportText = JSON.stringify(report, null, 2);
const reportSha256 = digest(reportText);
const reportFile = 'tahkik-external-rerun-report-' + finishedAt.replace(/[:.]/g,'-') + '.json';
fs.writeFileSync(reportFile, reportText + '\n');
console.log('TAHKIK Portable Rerun');
console.log('Suite:', SUITE_VERSION);
console.log('Passed:', passedCases + '/' + cases.length);
console.log('Failed:', cases.length - passedCases);
console.log('Unsafe handled:', unsafeHandledCount);
console.log('Fixture SHA-256:', FIXTURE_SHA256);
console.log('Report SHA-256:', reportSha256);
console.log('Report:', reportFile);
if (passedCases !== cases.length || unsafeHandledCount !== 0) process.exitCode = 1;
