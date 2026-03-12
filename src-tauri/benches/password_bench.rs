use criterion::{criterion_group, criterion_main, BenchmarkId, Criterion, Throughput};
use madmax_pass_lib::password::generate;

fn bench_generate_password(c: &mut Criterion) {
    let mut group = c.benchmark_group("password_generation");
    for &length in &[32usize, 64, 128, 1024, 4096] {
        group.throughput(Throughput::Bytes(length as u64));
        group.bench_with_input(
            BenchmarkId::from_parameter(length),
            &length,
            |b, &len| {
                b.iter(|| {
                    let value = generate(len, true, true, true, true)
                        .expect("generation should succeed");
                    std::hint::black_box(value);
                });
            },
        );
    }
    group.finish();
}

criterion_group!(benches, bench_generate_password);
criterion_main!(benches);
