import "./Footer.css";

const BG_MAP = {
  light: "#EBE8E3",
  blue: "#0000fe",
};

export default function Footer({ bg = "light" }) {
  const resolvedBg = BG_MAP[bg] ?? BG_MAP.light;

  return (
    <footer
      className={`awakeFooter awakeFooter--${bg}`}
      style={{ ["--footer-bg"]: resolvedBg }}
      role="contentinfo"
    >
      <div className="awakeFooter__inner">
        <h2 className="awakeFooter__title" aria-label="Stay Awake">
          <span className="awakeFooter__word">STAY</span>
          <span className="awakeFooter__word">AWAKE</span>
        </h2>

        <div className="awakeFooter__bottom">
          <div className="awakeFooter__col awakeFooter__col--left">
            <div className="awakeFooter__block">
              <div className="awakeFooter__head">Miami</div>
              <div className="awakeFooter__line">401 69st, Miami Beach</div>
              <div className="awakeFooter__line">ZC 33141</div>
            </div>
          </div>

          <div className="awakeFooter__col awakeFooter__col--mid">
            <div className="awakeFooter__block awakeFooter__block--center">
              <a className="awakeFooter__link" href="mailto:stayawake@awk.agency">
                stayawake@awk.agency
              </a>
              <a className="awakeFooter__link" href="tel:+13059034659">
                (+1) 305 903 4659
              </a>
              <a className="awakeFooter__link" href="tel:+541168563765">
                (+54) 11 6856 3765
              </a>
            </div>
          </div>

          <div className="awakeFooter__col awakeFooter__col--right">
            <div className="awakeFooter__block awakeFooter__block--right">
              <div className="awakeFooter__head">Buenos Aires</div>
              <div className="awakeFooter__line">3 de febrero 2340,</div>
              <div className="awakeFooter__line">2nd floor. ZC 1428</div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
