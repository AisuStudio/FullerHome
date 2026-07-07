import Link from "next/link";
import Datasheet from "@/components/ui/Datasheet";
import { Locale } from "@/lib/i18n/locale";
import { withLocale } from "@/lib/i18n/paths";
import styles from "../../page.module.css";

export default function AboutContentDe({ locale }: { locale: Locale }) {
  return (
    <>
      <h2>Die Idee</h2>
      <p>
        Inspiriert von der{" "}
        <a
          href="https://www.itke.uni-stuttgart.de/de/forschung/realisierte_projekte/landesgartenschau-exhibition-hall-2014/"
          target="_blank"
          rel="noreferrer"
        >
          <strong>Ausstellungshalle der Landesgartenschau 2014</strong>
        </a>{" "}
        in Schwäbisch Gmünd (ICD/ITKE, Universität Stuttgart): eine selbsttragende
        Plattenschale aus 243 einzigartigen Buchen-Sperrholzplatten, verbunden durch
        7.600 robotisch gefräste Fingerzinken-Verbindungen — nur 50&nbsp;mm dünn, dem
        Skelett eines Seeigels nachempfunden.
      </p>
      <figure className={styles.figure}>
        <img
          src="https://www.itke.uni-stuttgart.de/img/gallery/LAGA/ICD_ITKE/folie36.jpg?__scale=w:880,h:660,cx:0,cy:0,cw:800,ch:600"
          alt="Ausstellungshalle der Landesgartenschau 2014, Schwäbisch Gmünd — robotisch gefertigte Buchen-Sperrholz-Plattenschale"
          loading="lazy"
        />
        <figcaption>
          Ausstellungshalle Landesgartenschau 2014 · © ICD/ITKE Universität Stuttgart ·
          Foto: Roland Halbe
        </figcaption>
      </figure>
      <p>
        <strong>Die Besonderheit dieser Simulation:</strong> Statt Vorfertigung in
        einer Fabrikhalle steht der Roboter direkt auf der Baustelle. Rohplatten
        werden angeliefert, vor Ort per CNC gefräst und Platte für Platte montiert —
        die Baustelle wird zur Fabrik. Kein Schwertransport, keine Kranlogistik für
        überdimensionierte Module.
      </p>

      <h2>Warum &bdquo;FullerHome&ldquo;?</h2>
      <p>
        Der Name ehrt <strong>Richard Buckminster Fuller</strong> (1895–1983), der die
        geodätische Kuppel in den späten 1940er-Jahren populär machte. Fullers
        Obsession war &bdquo;mehr mit weniger erreichen&ldquo;: Eine Kugel umschließt
        das größte Volumen mit der geringsten Oberfläche, und ein geodätisches Gitter
        verteilt Lasten so gleichmäßig, dass die Struktur weder Stützen noch Balken
        noch tragende Innenwände braucht. Seine Vision ging über die Geometrie hinaus
        — er stellte sich massenproduzierte, per Flugzeug lieferbare Häuser vor (das
        Dymaxion House), Jahrzehnte bevor jemand von Vorfertigung oder Serienbau
        sprach. Ein Roboter, der vor Ort aus einem Flachpaket von Platten eine Kuppel
        montiert, kommt Fullers ursprünglicher Idee wohl näher als die meisten zu
        seinen Lebzeiten gebauten Dinge.
      </p>

      <div className={styles.cardGrid}>
        <div className={styles.card}>
          <h3>Wo Kuppeln glänzen</h3>
          <p>
            ~30% weniger Hüllfläche pro m³ als ein Quader — weniger Material, weniger
            Wärmeverlust. Aerodynamisch bei Sturm und Schnee. Stützenfreie Spannweite,
            ideal für offene Grundrisse, Werkstätten, Gewächshäuser, Veranstaltungs-
            und Gemeinschaftsräume. Die stärkste Struktur pro Kilogramm Material, die
            wir zu bauen wissen.
          </p>
        </div>
        <div className={styles.card}>
          <h3>Wo sie an Grenzen stoßen</h3>
          <p>
            Gekrümmte Wände widersprechen dem rechtwinkligen Alltag: Möbel, Küchen,
            Standardfenster und -türen setzen alle rechte Winkel voraus. Jede Platte
            ist einzigartig — es gibt keine Standardteile (genau das Problem, das
            robotische Fertigung löst). Innenraumaufteilung verschenkt die offene
            Spannweite, die Akustik kann lebhaft sein, und der Wiederverkaufsmarkt ist
            konservativ.
          </p>
        </div>
        <div className={styles.card}>
          <h3>Der Sweet Spot</h3>
          <p>
            Kuppeln ergeben dort am meisten Sinn, wo ihre Stärken zählen und ihre
            Schwächen nicht ins Gewicht fallen: Park-Unterstände, Besucher- und
            Tourismusbüros, Gemeinschaftsräume, netzunabhängige Bauten und
            Katastrophenhilfe — kleine bis mittlere öffentliche Gebäude mit einer
            offenen Funktion, nicht raumaufgeteilte Grundrisse. Genau deshalb bildet
            diese Simulation einen Unterstand, ein Büro und eine Bibliothek ab statt
            eines Privathauses.
          </p>
        </div>
      </div>

      <h2>Wie die Simulation funktioniert</h2>
      <div className={styles.cardGrid}>
        <div className={styles.card}>
          <h3>Parametrisches Design</h3>
          <p>
            Typologie + Budget erzeugen deterministisch das Gebäude: Goldberg-Geometrie
            (Sechs-/Fünfecke als Dual eines geodätischen Ikosaeders),
            Verglasungsanteil, Tür, Stückliste und Kosten. Gleiche Eingabe → gleiches
            Gebäude.
          </p>
        </div>
        <div className={styles.card}>
          <h3>Bausequenz</h3>
          <p>
            Eine Platte wird nur platziert, wenn sie das Fundament oder bereits
            gebaute Nachbarn berührt — Ring für Ring, von unten nach oben, genau wie
            es die statische Logik einer Schale verlangt. Keine schwebenden Teile,
            mathematisch validiert.
          </p>
        </div>
        <div className={styles.card}>
          <h3>Roboter-Kinematik</h3>
          <p>
            Kettenfahrzeug-Roboter in realistischem Maßstab (~3,5 m Reichweite),
            inverse Kinematik in Echtzeit. Da sein Arm die Schale nicht von einem
            Standort aus abdecken kann, positioniert er sich um: Pro Platte fährt er
            zum zentralen Depot, greift, fräst per CNC, fährt dann zur nächstgelegenen
            Arbeitsstation und platziert. Ist die Schale fertig, fährt er durch die
            Türöffnung hinaus.
          </p>
        </div>
      </div>

      <h2>Der Roboter: In-situ Fabricator</h2>
      <p>
        Die Maschine in dieser Simulation ist dem{" "}
        <a
          href="https://gramaziokohler.arch.ethz.ch/web/e/forschung/324.html"
          target="_blank"
          rel="noreferrer"
        >
          <strong>In-situ Fabricator</strong>
        </a>{" "}
        nachempfunden, entwickelt an der ETH Zürich (NCCR Digital Fabrication): ein
        kettenfahrender, selbstnavigierender Baurobotor — ein Industriearm auf
        Raupenketten mit eigener Stromversorgung und Steuerung, gebaut, um direkt auf
        der Baustelle statt in einer Fabrik zu fertigen. Er bewies das Konzept in
        Projekten wie Mesh Mould und dem DFAB HOUSE, wo er tragende Wände in
        Originalgröße vor Ort baute.
      </p>
      <p>
        Die Simulation funktioniert jetzt so wie die echte Maschine: Sie{" "}
        <strong>positioniert sich um</strong> — fährt zwischen einer Handvoll
        Arbeitsstationen innerhalb des Grundrisses hin und her, weil ihr Arm die
        gesamte Schale nicht von einem Standort aus erreichen kann. Zwei ehrliche
        Lücken bleiben: Der originale IF trägt etwa 40&nbsp;kg bei 2,55&nbsp;m
        Reichweite — unsere Buchenplatten wiegen 50–80&nbsp;kg, ein realer Einsatz
        bräuchte also die nächste Traglastklasse (oder zwei Roboter, die sich die
        Last teilen). Und die teleskopierbare vertikale Hubsäule ist eine
        konzeptionelle Erweiterung. Beides sind ingenieurtechnische Schritte, keine
        Forschungsfragen — genau das lässt robotische Montage vor Ort greifbar nah
        erscheinen.
      </p>

      <h2>Simulation vs. Realität</h2>
      <p>
        Die Simulation zeigt die reine robotische Montagezeit. Ein ehrlicher
        Bauzeitenplan sieht anders aus:
      </p>
      <table className={styles.compareTable}>
        <thead>
          <tr>
            <th>Phase</th>
            <th>Simulation</th>
            <th>Realistisch</th>
          </tr>
        </thead>
        <tbody>
          <tr><td>Baugenehmigung</td><td>—</td><td>3–12 Monate</td></tr>
          <tr><td>Fundament + Erschließung</td><td>—</td><td>3–4 Wochen (inkl. Aushärtung)</td></tr>
          <tr><td>Schale (Fräsen ∥ Montage)</td><td>1–3 Tage</td><td>1–2 Wochen</td></tr>
          <tr><td>Wetterhülle + Fenster</td><td>—</td><td>1–2 Wochen</td></tr>
          <tr><td>Innenausbau</td><td>5–10 Wochen</td><td>8–14 Wochen</td></tr>
          <tr className={styles.totalRow}><td>Schlüsselfertig ab Baubeginn</td><td>~6 Wochen</td><td>4–6 Monate</td></tr>
        </tbody>
      </table>
      <p className={styles.note}>
        Größte offene Fragen für echtes Wohnen: Dämmung (eine 50&nbsp;mm dünne Schale
        erfüllt keine energetischen Vorgaben — ein reales Gebäude braucht eine
        Dämmschicht plus Innenschale), Fugendichtigkeit, Brandschutz. Die ITKE-Halle
        war ein unbeheizter Ausstellungsraum.
      </p>

      <h2>Kostenmodell</h2>
      <p>
        Grobe Schätzungen zur Veranschaulichung des parametrischen Modells,
        Größenordnung 2026 — keine Angebote: gefertigte Brettsperrholz-Schale ≈
        420&nbsp;€/m² inkl. Fräsen und Verbindern, Isolierverglasung ≈ 650&nbsp;€/m²,
        Innenausbau ≈ 1.400&nbsp;€/m² (vgl. BKI-Baukostendaten), Erschließung
        25.000&nbsp;€ pauschal, Robotereinsatz 35.000&nbsp;€, Planung &amp;
        Genehmigungen 8%. Der Versorgungskern bündelt Strom, Wasser und Abwasser in
        der Gebäudemitte — kurze Leitungswege, keine Rohre innerhalb der
        Schalenplatten.
      </p>

      <h2>Datenblatt</h2>
      <p>
        Alle Werte reagieren live auf den Gebäudetyp und das Budget, die auf der{" "}
        <Link href={withLocale(locale, "/")}>Simulationsseite</Link> eingestellt sind
        — ändere dort die Konfiguration, und das Datenblatt rechnet neu.
      </p>
      <Datasheet locale={locale} />

      <h2>Roadmap</h2>
      <ul className={styles.roadmap}>
        <li>Physik-Engine (Rapier) für Materialverhalten und Falleffekte</li>
        <li>Dämmung und Innenschale im Modell (energetisch normkonform)</li>
        <li>Modul-Einflug: Treppe und Zwischengeschoss durch die offene Kuppelspitze</li>
        <li>Zwei Roboter im Tandem (Fräsen und Montage getrennt)</li>
        <li>Stücklisten-Export als CNC-Fertigungsdaten</li>
      </ul>
    </>
  );
}
