import { getTranslations } from 'next-intl/server';

interface Step {
  title: string;
  description: string;
}

export async function HowItWorksSteps() {
  const t = await getTranslations('HowItWorksSteps');
  const steps = t.raw('steps') as Step[];

  return (
    <section className="how-section">
      <div className="how-inner">
        <div className="section-tag">{t('tag')}</div>
        <h2 className="section-title">{t.rich('title', { em: (chunks) => <em>{chunks}</em> })}</h2>
        <div className="how-steps">
          {steps.map((step, index) => (
            <div className="how-step" key={step.title}>
              <div className="how-step-num">{index + 1}</div>
              <h3>{step.title}</h3>
              <p>{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
