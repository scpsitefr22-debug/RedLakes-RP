/**
 * Fond cartographique de la carte interactive — carte dessinée à la main
 * fournie par l'équipe, servie depuis /public/carte/redlakes-map.png.
 * Purement visuel : les positions réelles des lieux restent pilotées par
 * l'API (/map), le pourcentage x/y de chaque pin est calé sur cette image.
 */
export function SiteMapBackground() {
  return (
    <div
      className="absolute inset-0 h-full w-full bg-black bg-cover bg-center"
      style={{ backgroundImage: "url(/carte/redlakes-map.png)" }}
      aria-hidden="true"
    >
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 50% 45%, transparent 0%, rgba(0,0,0,0.35) 75%, rgba(0,0,0,0.6) 100%)",
        }}
      />
    </div>
  );
}
