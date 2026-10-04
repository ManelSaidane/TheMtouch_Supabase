
import { ArrowUpRight, Mail, MessageCircle } from "lucide-react";
import Navbar from "../components/Navbar";

function Contact() {
  return (
    <>
      <Navbar />

      <main className="contact-page">

        {/* HERO */}
        <section className="contact-hero">
          <div className="contact-hero-content">

            <p className="section-eyebrow">
              GET IN TOUCH
            </p>

            <h1>
              Let's talk.
              <br />
              <em>The M Touch.</em>
            </h1>

            <p className="contact-hero-text">
              Have a question, need help choosing a piece, or want to
              know more about our products? We'd love to hear from you.
            </p>

            <div className="contact-main-actions">

              <a
                href="https://www.instagram.com/themtouch.tn/"
                target="_blank"
                rel="noopener noreferrer"
                className="contact-instagram-button"
              >
                <span className="social-letter instagram-letter">
                  ◎
                </span>

                <span>
                  Contact us on Instagram
                </span>

                <ArrowUpRight
                  size={17}
                  strokeWidth={1.5}
                />
              </a>

              <a
                href="mailto:saidaneemanel@gmail.com"
                className="contact-email-button"
              >
                <Mail
                  size={18}
                  strokeWidth={1.5}
                />

                <span>
                  Email us
                </span>
              </a>

            </div>

          </div>
        </section>


        {/* CONTACT OPTIONS */}
        <section className="contact-options">

          <div className="contact-options-heading">

            <p className="section-eyebrow">
              WE'RE HERE TO HELP
            </p>

            <h2>
              What can we
              <br />
              help you with?
            </h2>

          </div>


          <div className="contact-options-list">

            <div className="contact-option">

              <div className="contact-option-number">
                01
              </div>

              <div>
                <h3>
                  Product questions
                </h3>

                <p>
                  Want to know more about a product,
                  its details, availability, or sizing?
                  Send us a message.
                </p>
              </div>

            </div>


            <div className="contact-option">

              <div className="contact-option-number">
                02
              </div>

              <div>
                <h3>
                  Need help choosing?
                </h3>

                <p>
                  Looking for the perfect piece for
                  yourself or someone special? We can
                  help you find the right one.
                </p>
              </div>

            </div>


            <div className="contact-option">

              <div className="contact-option-number">
                03
              </div>

              <div>
                <h3>
                  Order & delivery
                </h3>

                <p>
                  Have a question about your order,
                  delivery, or tracking? We're happy
                  to help.
                </p>
              </div>

            </div>

          </div>

        </section>


        {/* CONTACT CHANNELS */}
        <section className="contact-channels">

          <div className="contact-channels-heading">

            <p className="section-eyebrow">
              FIND US
            </p>

            <h2>
              Stay connected
              <br />
              with us.
            </h2>

          </div>


          <div className="contact-channel-list">

            {/* INSTAGRAM */}
            <a
              href="https://www.instagram.com/themtouch.tn/"
              target="_blank"
              rel="noopener noreferrer"
              className="contact-channel"
            >
              <div className="contact-channel-icon">
                <span className="instagram-icon">
                  ◎
                </span>
              </div>

              <div>
                <span>
                  INSTAGRAM
                </span>

                <strong>
                  @themtouch.tn
                </strong>
              </div>

              <ArrowUpRight
                size={18}
                strokeWidth={1.4}
              />
            </a>


            {/* FACEBOOK */}
            <a
              href="https://www.facebook.com/profile.php?id=61578417427767"
              target="_blank"
              rel="noopener noreferrer"
              className="contact-channel"
            >
              <div className="contact-channel-icon">
                <span className="facebook-icon">
                  f
                </span>
              </div>

              <div>
                <span>
                  FACEBOOK
                </span>

                <strong>
                  The M Touch
                </strong>
              </div>

              <ArrowUpRight
                size={18}
                strokeWidth={1.4}
              />
            </a>


            {/* EMAIL */}
            <a
              href="mailto:saidaneemanel@gmail.com"
              className="contact-channel"
            >
              <div className="contact-channel-icon">
                <Mail
                  size={21}
                  strokeWidth={1.4}
                />
              </div>

              <div>
                <span>
                  EMAIL
                </span>

                <strong>
                  saidaneemanel@gmail.com
                </strong>
              </div>

              <ArrowUpRight
                size={18}
                strokeWidth={1.4}
              />
            </a>

          </div>

        </section>


        {/* FINAL */}
        <section className="contact-final">

          <p className="section-eyebrow">
            THE M TOUCH
          </p>

          <h2>
            Your style.
            <br />
            <em>Your touch.</em>
          </h2>

        </section>

      </main>
    </>
  );
}

export default Contact;
