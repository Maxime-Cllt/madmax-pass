use crate::crack;
use crate::models::AnalyzeResult;

pub fn analyze_password(password: &str) -> AnalyzeResult {
    let has_upper = password.chars().any(|c| c.is_ascii_uppercase());
    let has_lower = password.chars().any(|c| c.is_ascii_lowercase());
    let has_digits = password.chars().any(|c| c.is_ascii_digit());
    let has_symbols = password
        .chars()
        .any(|c| c.is_ascii() && !c.is_ascii_alphanumeric() && !c.is_ascii_control());
    let length = password.chars().count();

    let pool_size = {
        let mut p = 0usize;
        if has_lower {
            p += 26;
        }
        if has_upper {
            p += 26;
        }
        if has_digits {
            p += 10;
        }
        if has_symbols {
            p += 27;
        }
        p
    };

    let entropy_per_char = if pool_size > 0 {
        (pool_size as f64).log2()
    } else {
        0.0
    };

    let estimate = if length > 0 {
        crack::estimate(length, has_upper, has_lower, has_digits, has_symbols)
    } else {
        crack::CrackEstimate {
            classical_bits: 0,
            quantum_bits: 0,
            quantum_safe: false,
            scenarios: vec![],
        }
    };

    let warnings = if length > 0 {
        detect_warnings(password)
    } else {
        vec![]
    };
    let diversity = [has_upper, has_lower, has_digits, has_symbols]
        .iter()
        .filter(|&&x| x)
        .count();
    let score = if length > 0 {
        compute_score(estimate.classical_bits, diversity, &warnings)
    } else {
        0
    };

    AnalyzeResult {
        length,
        pool_size,
        has_upper,
        has_lower,
        has_digits,
        has_symbols,
        entropy_per_char,
        score,
        warnings,
        estimate,
    }
}

fn detect_warnings(password: &str) -> Vec<String> {
    let chars: Vec<char> = password.chars().collect();
    let len = chars.len();
    let mut warnings = Vec::new();

    // Length checks
    if len < 8 {
        warnings.push("Trop court — minimum recommandé : 12 caractères".into());
    } else if len < 12 {
        warnings.push("Longueur faible — recommandé : ≥ 12 caractères".into());
    }

    // Consecutive repeated chars (3+)
    if len >= 3 {
        let mut run = 1usize;
        let mut max_run = 1usize;
        for i in 1..len {
            if chars[i] == chars[i - 1] {
                run += 1;
                if run > max_run {
                    max_run = run;
                }
            } else {
                run = 1;
            }
        }
        if max_run >= 3 {
            warnings.push(format!(
                "Répétition de caractères ({} consécutifs identiques)",
                max_run
            ));
        }
    }

    // Ascending/descending sequential chars (4+)
    if len >= 4 {
        let mut asc = 1usize;
        let mut max_asc = 1usize;
        for i in 1..len {
            if chars[i] as i32 == chars[i - 1] as i32 + 1 {
                asc += 1;
                if asc > max_asc {
                    max_asc = asc;
                }
            } else {
                asc = 1;
            }
        }
        if max_asc >= 4 {
            warnings.push("Séquence ascendante détectée (ex : abcd, 1234)".into());
        }

        let mut desc = 1usize;
        let mut max_desc = 1usize;
        for i in 1..len {
            if chars[i] as i32 == chars[i - 1] as i32 - 1 {
                desc += 1;
                if desc > max_desc {
                    max_desc = desc;
                }
            } else {
                desc = 1;
            }
        }
        if max_desc >= 4 {
            warnings.push("Séquence descendante détectée (ex : dcba, 9876)".into());
        }
    }

    // Year pattern (19xx / 20xx)
    if len >= 4 {
        let has_year = (0..=len - 4).any(|i| {
            let a = chars[i];
            let b = chars[i + 1];
            let c = chars[i + 2];
            let d = chars[i + 3];
            c.is_ascii_digit()
                && d.is_ascii_digit()
                && ((a == '1' && b == '9') || (a == '2' && b == '0'))
        });
        if has_year {
            warnings.push("Contient une année (ex : 1990, 2024)".into());
        }
    }

    // Single character class diversity
    let classes = [
        chars.iter().any(|c| c.is_ascii_uppercase()),
        chars.iter().any(|c| c.is_ascii_lowercase()),
        chars.iter().any(|c| c.is_ascii_digit()),
        chars.iter().any(|c| c.is_ascii() && !c.is_ascii_alphanumeric() && !c.is_ascii_control()),
    ];
    if len > 0 && classes.iter().filter(|&&x| x).count() == 1 {
        warnings.push("Un seul type de caractère — diversifiez votre mot de passe".into());
    }

    // Repeated substring (e.g. "abcabc")
    if len >= 6 {
        let pat_len = len / 2;
        'outer: for plen in 2..=pat_len {
            if len % plen == 0 {
                let pattern = &chars[..plen];
                let mut all_same = true;
                for chunk in chars.chunks(plen) {
                    if chunk != pattern {
                        all_same = false;
                        break;
                    }
                }
                if all_same {
                    warnings.push(format!(
                        "Motif répété détecté (bloc de {} car. répété)",
                        plen
                    ));
                    break 'outer;
                }
            }
        }
    }

    warnings
}

fn compute_score(classical_bits: u32, diversity: usize, warnings: &[String]) -> u8 {
    // Entropy: up to 65 pts (128 bits = full score)
    let entropy_pts = (classical_bits.min(128) as f64 / 128.0 * 65.0) as u8;
    // Diversity: up to 20 pts (5 per class)
    let diversity_pts = (diversity * 5) as u8;
    // Length bonus: up to 10 pts
    let length_bonus: u8 = 0; // computed separately if needed
    // Warning penalty: -7 per warning
    let penalty = (warnings.len() as u8).saturating_mul(7);

    (entropy_pts + diversity_pts + length_bonus)
        .saturating_sub(penalty)
        .min(100)
}
