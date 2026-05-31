import "./index.css";
import "/src/variables.css";
import { LuCopyright } from "react-icons/lu";

export default function Footer() {
  return (
    <footer className="landing-footer">
      <div className="copyright">
        <span>
          <LuCopyright />
        </span>
        <p>2026 EcoNexo. Todos os direitos reservados.</p>
      </div>
    </footer>
  );
}
