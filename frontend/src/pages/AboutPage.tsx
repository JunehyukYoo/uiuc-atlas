import { Link } from "react-router-dom";

function AboutPage() {
  return (
    <div className="max-w-2xl mx-auto px-6 py-12 space-y-10">
      <div className="space-y-3">
        <h1 className="text-3xl font-bold tracking-tight">About UIUC Atlas</h1>
        <p className="text-muted-foreground text-base leading-relaxed">
          UIUC Atlas is a capstone project that creates an interactive emotional
          map of the University of Illinois Urbana-Champaign campus. It invites
          students to record how they feel in specific places — and to see, in
          aggregate, how those feelings pattern across the spaces we all share.
        </p>
      </div>

      <div className="space-y-3">
        <h2 className="text-xl font-semibold">The Question Behind the Map</h2>
        <p className="text-muted-foreground leading-relaxed">
          Campus spaces are designed with intent — to encourage study,
          collaboration, rest, or movement. But the lived experience of those
          spaces doesn't always match the intent. UIUC Atlas asks:{" "}
          <span className="text-foreground italic">
            How might the spaces on campus be experienced differently than they
            were designed to be?
          </span>
        </p>
        <p className="text-muted-foreground leading-relaxed">
          Rather than starting from assumptions about what students need, this
          project surfaces patterns from the ground up — through the emotional
          responses of the people who actually inhabit these spaces every day.
        </p>
      </div>

      <div className="space-y-3">
        <h2 className="text-xl font-semibold">How It Works</h2>
        <p className="text-muted-foreground leading-relaxed">
          To make a submission, click anywhere on the map to drop a pin. You'll
          be asked to select an emotion from one of six categories — Happy, Sad,
          Calm, Anxious, Excited, or Angry — and rate its intensity on a scale
          of 1 to 5. You can optionally add a short reflection (up to 280
          characters) and one or more tags that describe your identity or
          context.
        </p>
        <p className="text-muted-foreground leading-relaxed">
          The map has two viewing modes. In{" "}
          <span className="text-foreground font-medium">Pins</span> mode,
          individual submissions appear as colored markers on the map, and you
          can filter by emotion, intensity range, and tags to explore specific
          subsets of the data. In{" "}
          <span className="text-foreground font-medium">Heatmap</span> mode,
          submissions are aggregated into color-coded density layers — one per
          emotion — that reveal where feelings cluster across campus.
        </p>
      </div>

      <div className="space-y-3">
        <h2 className="text-xl font-semibold">Approach</h2>
        <p className="text-muted-foreground leading-relaxed">
          UIUC Atlas was developed using a Human-Centered Design methodology.
          The goal is not to produce a definitive account of campus experience,
          but to create a tool that opens a conversation — between students,
          administrators, and designers — about how emotional experience of
          space can inform the way those spaces are maintained, modified, or
          reimagined.
        </p>
        <p className="text-muted-foreground leading-relaxed">
          Patterns that emerge from the map are meant to surface questions, not
          prescribe answers. A cluster of anxiety near a building might reflect
          academic pressure, social dynamics, physical design, or something else
          entirely. The data alone doesn't tell us — but it gives us a place to
          start asking.
        </p>
      </div>

      <div className="space-y-3">
        <h2 className="text-xl font-semibold">Participation</h2>
        <p className="text-muted-foreground leading-relaxed">
          Submissions are anonymous by design. No personally identifiable
          information is collected. For more details on what data is and isn't
          gathered, see the{" "}
          <Link
            to="/privacy"
            className="text-foreground underline underline-offset-4"
          >
            Privacy page
          </Link>
          .
        </p>
      </div>
    </div>
  );
}

export default AboutPage;
