const MenuIcon = ({ strokeColor = "#000000", size = 24 }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke={strokeColor}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    width={size}
    height={size}
  >
    <circle cx="12" cy="12" r="10" />
    <circle cx="8" cy="12" r="1" />
    <circle cx="12" cy="12" r="1" />
    <circle cx="16" cy="12" r="1" />
  </svg>
)

export default MenuIcon
