function PrivacyPage() {
  return (
    <div className="max-w-2xl mx-auto px-6 py-12 space-y-10">
      <div className="space-y-3">
        <h1 className="text-3xl font-bold tracking-tight">Privacy</h1>
        <p className="text-muted-foreground text-base leading-relaxed">
          UIUC Atlas is built around a simple principle: participation should
          feel safe. Emotional data is personal, and the project takes that
          seriously.
        </p>
      </div>

      <div className="space-y-3">
        <h2 className="text-xl font-semibold">Anonymous by Design</h2>
        <p className="text-muted-foreground leading-relaxed">
          Submissions are anonymous. No names, NetIDs, email addresses, or any
          other personally identifiable information are collected at any point.
          There is no login requirement, and submissions cannot be traced back
          to an individual.
        </p>
      </div>

      <div className="space-y-3">
        <h2 className="text-xl font-semibold">What Is Collected</h2>
        <p className="text-muted-foreground leading-relaxed">
          Each submission records the following:
        </p>
        <ul className="list-disc list-inside space-y-1 text-muted-foreground">
          <li>A map location (latitude and longitude)</li>
          <li>
            An emotion category (Happy, Sad, Calm, Anxious, Excited, or Angry)
          </li>
          <li>An intensity rating (1–5)</li>
          <li>An optional short reflection (up to 280 characters)</li>
          <li>
            Optional tags describing identity or context (e.g. international
            student, commuter, first-generation student)
          </li>
        </ul>
        <p className="text-muted-foreground leading-relaxed">
          The reflection and tags fields are entirely optional. Providing them
          helps others understand the context of a submission, but nothing about
          participation depends on filling them out.
        </p>
      </div>

      <div className="space-y-3">
        <h2 className="text-xl font-semibold">How Emotional Data Is Treated</h2>
        <p className="text-muted-foreground leading-relaxed">
          Emotional input collected by UIUC Atlas is situational and contextual.
          Selecting "Anxious" near a building does not imply a clinical or
          persistent mental health state — it reflects a moment, a place, and a
          feeling in that specific context.
        </p>
        <p className="text-muted-foreground leading-relaxed">
          This data is not shared with health services, advisors, or any third
          party. It is used solely for aggregate visualization and pattern
          analysis across campus spaces. Individual submissions are never
          surfaced in a way that could identify or characterize any specific
          person.
        </p>
      </div>

      <div className="space-y-3">
        <h2 className="text-xl font-semibold">Data Use</h2>
        <p className="text-muted-foreground leading-relaxed">
          Submissions contribute to the public map and may be used in aggregate
          analysis as part of the UIUC Atlas capstone research project. The goal
          of that analysis is to map spatial patterns in how campus environments
          are emotionally experienced — not to draw conclusions about
          individuals.
        </p>
      </div>

      <div className="space-y-3">
        <h2 className="text-xl font-semibold">Questions</h2>
        <p className="text-muted-foreground leading-relaxed">
          If you have questions or concerns about data collection or privacy,
          you are welcome to reach out to the{" "}
          <a
            href="https://las.illinois.edu/resources/international/globallearning/leaders"
            target="_blank"
            className="text-foreground underline underline-offset-4"
          >
            Global Leaders Program
          </a>{" "}
          through the University of Illinois or my personal email at{" "}
          <a
            href="mailto:jy58@illinois.edu"
            className="text-foreground underline underline-offset-4"
          >
            jy58@illinois.edu
          </a>
          .
        </p>
      </div>
    </div>
  );
}

export default PrivacyPage;
