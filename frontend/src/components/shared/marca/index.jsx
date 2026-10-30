/** Símbolo do EcoNexo: raio branco sobre círculo verde. Decorativo. */
export default function Marca({ tamanho = 22 }) {
  return (
    <svg width={tamanho} height={tamanho} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <circle cx="12" cy="12" r="11" fill="#0a7f4f" />
      <path d="M13.2 4.5 7.5 13h4l-1 6.5L16.5 11h-4z" fill="#fff" />
    </svg>
  );
}
