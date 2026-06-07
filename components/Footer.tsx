export default function Footer() {
  return (
    <footer>
      <div className="footer-inner">
        <div className="footer-grid">
          <div className="footer-brand">
            <div className="footer-logo-text">Furri<span>Hearts</span></div>
            <p>Matching hearts. Creating forever homes.<br/>Malaysia's trusted pet adoption platform.</p>
          </div>
          <div className="footer-col">
            <h4>For Adopters</h4>
            <a href="/browse">Adopt a Pet</a>
            <a href="/furrimatch">FurriMatch</a>
          </div>
          <div className="footer-col">
            <h4>For Rescuers</h4>
            <a href="/rescuer-listing">List a Pet</a>
          </div>
          <div className="footer-col">
            <h4>Company</h4>
            <a href="/about">About Us</a>
            <a href="/contact">Contact</a>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© 2026 FurriHearts. All rights reserved.</span>
          <span>Made with ❤️ for animals in Malaysia</span>
        </div>
      </div>
    </footer>
  );
}