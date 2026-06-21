interface Step {
  num: number;
  title: string;
  description: string;
}

const STEPS: Step[] = [
  { num: 1, title: 'Find Your Match', description: 'Browse pets that fit your lifestyle and home.' },
  { num: 2, title: 'Apply', description: 'Submit a short questionnaire. Your profile is automatically included.' },
  { num: 3, title: 'Pending Approval', description: 'The rescuer reviews your application and gets back to you.' },
  { num: 4, title: 'Connected', description: 'Coordinate collection with your rescuer and welcome your new family member home!' },
];

export function HowItWorksSteps() {
  return (
    <section className="how-section">
      <div className="how-inner">
        <div className="section-tag">Adoption Guide</div>
        <h2 className="section-title">Simple steps to a <em>successful adoption</em></h2>
        <div className="how-steps">
          {STEPS.map((step) => (
            <div className="how-step" key={step.num}>
              <div className="how-step-num">{step.num}</div>
              <h3>{step.title}</h3>
              <p>{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
