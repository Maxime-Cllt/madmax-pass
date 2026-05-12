export interface Scenario {
    label: string;
    hint: string;
    time: string;
    color: string;
}

export interface CrackEstimate {
    classical_bits: number;
    quantum_bits: number;
    quantum_safe: boolean;
    scenarios: Scenario[];
}

export interface GenerateResult {
    value: string;
    estimate: CrackEstimate;
}

export interface AnalyzeResult {
    length: number;
    pool_size: number;
    has_upper: boolean;
    has_lower: boolean;
    has_digits: boolean;
    has_symbols: boolean;
    entropy_per_char: number;
    score: number;
    warnings: string[];
    estimate: CrackEstimate;
}

export type View = "password" | "token" | "analyze";
