import logoSrc from '../assets/logo.png'

// Componente de logo reutilizable.
// `size` controla el alto en píxeles — el ancho se ajusta solo (aspect-ratio: auto).
// Úsalo así: <Logo size={48} /> o <Logo size={32} />
export default function Logo({ size = 40, className = '' }) {
  return (
    <img
      src={logoSrc}
      alt="SmartZone"
      className={className}
      style={{
        height: `${size}px`,
        width: 'auto',
        display: 'block',
        objectFit: 'contain',
        borderRadius: '8px',  // suaviza esquinas si el PNG tiene fondo cuadrado
      }}
    />
  )
}