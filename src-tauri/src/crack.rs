use serde::Serialize;

// Tailles des pools (doivent rester cohérentes avec password.rs)
const LOWER: usize = 26;
const UPPER: usize = 26;
const DIGITS: usize = 10;
const SYMBOLS: usize = 27;

// Vitesses d'attaque réalistes (log10 guesses/sec, matériel 2024)
//
// Offline hash rapide — NTLM/MD5 sur cluster 8× RTX 4090 : ~10^12 H/s
//   Cas le plus défavorable : hash non salé, algorithme rapide.
//
// Offline hash lent — bcrypt (cost 12) sur GPU : ~10^4 H/s
//   Cas réaliste pour les services qui sécurisent correctement leur base.
//
// Quantique (Grover) — Ordinateur quantique futur à 10^6 ops/s
//   Grover réduit la complexité de N → √N, soit une division par 2 des bits.
//   10^6 est une hypothèse généreuse pour l'attaquant (technologie ~2040+).
const FAST_HASH_LOG10_SPEED: f64 = 12.0;
const SLOW_HASH_LOG10_SPEED: f64 = 4.0;
const QUANTUM_LOG10_SPEED: f64 = 6.0;

#[derive(Serialize)]
pub struct Scenario {
    pub label: String,
    pub hint: String,
    pub time: String,
    pub color: String,
}

#[derive(Serialize)]
pub struct CrackEstimate {
    pub classical_bits: u32,
    pub quantum_bits: u32,
    pub quantum_safe: bool,
    /// [0] hash rapide, [1] hash lent, [2] quantique
    pub scenarios: Vec<Scenario>,
}

pub fn estimate(
    length: usize,
    upper: bool,
    lower: bool,
    digits: bool,
    symbols: bool,
) -> CrackEstimate {
    let pool = pool_size(upper, lower, digits, symbols);

    if pool == 0 || length == 0 {
        return CrackEstimate {
            classical_bits: 0,
            quantum_bits: 0,
            quantum_safe: false,
            scenarios: vec![],
        };
    }

    // Travail en log10 pour éviter tout overflow (entropies > 200 bits)
    let log10_keyspace = length as f64 * (pool as f64).log10();
    // Cas moyen = parcourir la moitié du keyspace
    let log10_avg = log10_keyspace - std::f64::consts::LOG10_2;

    let classical_bits = (length as f64 * (pool as f64).log2()).floor() as u32;
    let quantum_bits = classical_bits / 2;

    let scenarios = vec![
        Scenario {
            label: "Hash rapide".into(),
            hint: "NTLM / MD5 · cluster GPU 2024".into(),
            time: format_time(log10_avg - FAST_HASH_LOG10_SPEED),
            color: time_color(log10_avg - FAST_HASH_LOG10_SPEED).into(),
        },
        Scenario {
            label: "Hash lent".into(),
            hint: "bcrypt / Argon2 · GPU 2024".into(),
            time: format_time(log10_avg - SLOW_HASH_LOG10_SPEED),
            color: time_color(log10_avg - SLOW_HASH_LOG10_SPEED).into(),
        },
        Scenario {
            label: "Quantique".into(),
            hint: "Grover · 10⁶ ops/s".into(),
            // Grover : √keyspace opérations → log10_ops = log10_keyspace / 2
            time: format_time(log10_keyspace / 2.0 - std::f64::consts::LOG10_2 - QUANTUM_LOG10_SPEED),
            color: time_color(log10_keyspace / 2.0 - std::f64::consts::LOG10_2 - QUANTUM_LOG10_SPEED).into(),
        },
    ];

    CrackEstimate {
        classical_bits,
        quantum_bits,
        quantum_safe: quantum_bits >= 128,
        scenarios,
    }
}

fn pool_size(upper: bool, lower: bool, digits: bool, symbols: bool) -> usize {
    let mut p = 0;
    if lower { p += LOWER; }
    if upper { p += UPPER; }
    if digits { p += DIGITS; }
    if symbols { p += SYMBOLS; }
    p
}

fn format_time(log10_sec: f64) -> String {
    const LOG10_MIN: f64 = 1.778; // log10(60)
    const LOG10_HOUR: f64 = 3.556; // log10(3600)
    const LOG10_DAY: f64 = 4.934; // log10(86400)
    const LOG10_YEAR: f64 = 7.499; // log10(365.25 * 24 * 3600)

    if log10_sec < 0.0 {
        return "< 1 seconde".into();
    }
    if log10_sec < LOG10_MIN {
        let v = 10f64.powf(log10_sec).round().max(1.0) as u64;
        return format!("{} seconde{}", v, plural(v));
    }
    if log10_sec < LOG10_HOUR {
        let v = (10f64.powf(log10_sec) / 60.0).round().max(1.0) as u64;
        return format!("{} minute{}", v, plural(v));
    }
    if log10_sec < LOG10_DAY {
        let v = (10f64.powf(log10_sec) / 3600.0).round().max(1.0) as u64;
        return format!("{} heure{}", v, plural(v));
    }
    if log10_sec < LOG10_YEAR {
        let v = (10f64.powf(log10_sec) / 86400.0).round().max(1.0) as u64;
        return format!("{} jour{}", v, plural(v));
    }

    let log10_yrs = log10_sec - LOG10_YEAR;
    if log10_yrs < 3.0 {
        let v = 10f64.powf(log10_yrs).round().max(1.0) as u64;
        return format!("{} an{}", v, plural(v));
    }

    // Notation scientifique pour les valeurs astronomiques
    let exp = log10_yrs.floor() as i32;
    let mant = 10f64.powf(log10_yrs - exp as f64);
    if mant >= 9.95 {
        format!("~{} × 10^{} ans", mant.round() as i32, exp)
    } else {
        format!("~{:.1} × 10^{} ans", mant, exp)
    }
}

fn time_color(log10_sec: f64) -> &'static str {
    const LOG10_HOUR: f64 = 3.556;
    const LOG10_YEAR: f64 = 7.499;

    if log10_sec < LOG10_HOUR { return "text-rose-500"; }
    if log10_sec < LOG10_YEAR { return "text-orange-500"; }
    let log10_yrs = log10_sec - LOG10_YEAR;
    if log10_yrs < 4.0 { return "text-yellow-500"; }
    if log10_yrs < 9.0 { return "text-emerald-500"; }
    "text-cyan-400"
}

fn plural(v: u64) -> &'static str {
    if v > 1 { "s" } else { "" }
}

/// Estimation depuis un nombre de bits d'entropie brute (tokens, clés, etc.)
pub fn estimate_from_bits(entropy_bits: f64) -> CrackEstimate {
    if entropy_bits <= 0.0 {
        return CrackEstimate { classical_bits: 0, quantum_bits: 0, quantum_safe: false, scenarios: vec![] };
    }

    let log10_keyspace = entropy_bits * std::f64::consts::LOG10_2;
    let log10_avg = log10_keyspace - std::f64::consts::LOG10_2;
    let classical_bits = entropy_bits.floor() as u32;
    let quantum_bits = classical_bits / 2;

    let scenarios = vec![
        Scenario {
            label: "Hash rapide".into(),
            hint: "NTLM / MD5 · cluster GPU 2024".into(),
            time: format_time(log10_avg - FAST_HASH_LOG10_SPEED),
            color: time_color(log10_avg - FAST_HASH_LOG10_SPEED).into(),
        },
        Scenario {
            label: "Hash lent".into(),
            hint: "bcrypt / Argon2 · GPU 2024".into(),
            time: format_time(log10_avg - SLOW_HASH_LOG10_SPEED),
            color: time_color(log10_avg - SLOW_HASH_LOG10_SPEED).into(),
        },
        Scenario {
            label: "Quantique".into(),
            hint: "Grover · 10⁶ ops/s".into(),
            time: format_time(log10_keyspace / 2.0 - std::f64::consts::LOG10_2 - QUANTUM_LOG10_SPEED),
            color: time_color(log10_keyspace / 2.0 - std::f64::consts::LOG10_2 - QUANTUM_LOG10_SPEED).into(),
        },
    ];

    CrackEstimate { classical_bits, quantum_bits, quantum_safe: quantum_bits >= 128, scenarios }
}
