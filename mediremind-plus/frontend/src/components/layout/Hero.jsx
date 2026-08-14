import './Hero.css';

export default function Hero({ doctorImageSrc }) {
  return (
    <section className="mr-hero">
      <div className="mr-hero-inner">
        <div className="mr-hero-image">
          {doctorImageSrc ? (
            <img src={doctorImageSrc} alt="Healthcare provider" />
          ) : (
            <div className="mr-hero-image-placeholder" aria-hidden="true" />
          )}
        </div>

        <div className="mr-hero-copy">
          <h1>
            YOUR HEALTH,
            <br />
            <span className="mr-hero-accent">RIGHT ON TIME.</span>
          </h1>
          <p>Get smart medication reminders that keep you on track, wherever life takes you.</p>
          <div className="mr-hero-actions">
            <button className="mr-btn mr-btn-coral">Today's Dose</button>
            <button className="mr-btn mr-btn-outline">When Next?</button>
          </div>
        </div>
      </div>

      <div className="mr-hero-banner">
        <p>
          Healthy Habits Start
          <br />
          with Timely Reminders.
        </p>
      </div>
    </section>
  );
}
