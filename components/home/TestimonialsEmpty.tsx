import EmptyState from '@/components/EmptyState';

export function TestimonialsEmpty() {
  return (
    <section className="testimonials">
      <div className="testimonials-inner">
        <div className="section-header-center" style={{ marginBottom: '8px' }}>
          <div className="section-tag">What Adopters Say</div>
          <h2 className="section-title">Be the first to share your story 🐾</h2>
        </div>
        <EmptyState
          icon="💬"
          title="No reviews yet"
          description="We're just getting started. Once adoptions happen, happy adopters and rescuers will share their stories here."
          ctaLabel="Start Your Journey 🐾"
          ctaHref="/browse"
        />
      </div>
    </section>
  );
}
