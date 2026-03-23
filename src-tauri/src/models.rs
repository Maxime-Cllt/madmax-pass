use serde::Serialize;

use crate::crack::CrackEstimate;

#[derive(Serialize)]
pub struct GenerateResult {
    pub value: String,
    pub estimate: CrackEstimate,
}

#[derive(Serialize)]
pub struct AnalyzeResult {
    pub length: usize,
    pub pool_size: usize,
    pub has_upper: bool,
    pub has_lower: bool,
    pub has_digits: bool,
    pub has_symbols: bool,
    pub entropy_per_char: f64,
    pub score: u8,
    pub warnings: Vec<String>,
    pub estimate: CrackEstimate,
}
