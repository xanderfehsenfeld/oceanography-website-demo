export const Attribution = () => (
  <div className="flex justify-end">
    <div className="leaflet-control-attribution text-right">
      <a
        href="https://leafletjs.com"
        title="A JavaScript library for interactive maps"
      >
        <svg
          aria-hidden="true"
          xmlns="http://www.w3.org/2000/svg"
          width="12"
          height="8"
          viewBox="0 0 12 8"
          className="leaflet-attribution-flag"
        >
          <path fill="#4C7BE1" d="M0 0h12v4H0z"></path>
          <path fill="#FFD500" d="M0 4h12v3H0z"></path>
          <path fill="#E0BC00" d="M0 7h12v1H0z"></path>
        </svg>{" "}
        Leaflet
      </a>
      &copy;{" "}
      <a href="https://stadiamaps.com/" target="_blank">
        Stadia Maps
      </a>
      &copy;{" "}
      <a href="https://openmaptiles.org/" target="_blank">
        OpenMapTiles
      </a>
      &copy;{" "}
      <a href="https://www.openstreetmap.org/copyright" target="_blank">
        OpenStreetMap
      </a>
      &copy;
    </div>
  </div>
)
