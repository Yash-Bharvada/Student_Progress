const stats = [
  {
    value: "50K+",
    label: "Active Students",
    description: "tracking their progress"
  },
  {
    value: "2M+",
    label: "Commits Analyzed",
    description: "with AI insights"
  },
  {
    value: "98%",
    label: "Accuracy Rate",
    description: "in skill assessment"
  },
  {
    value: "4.9",
    label: "User Rating",
    description: "from students"
  }
]

export function StatsSection() {
  return (
    <section className="border-y border-border bg-secondary/30">
      <div className="mx-auto grid max-w-6xl grid-cols-2 divide-x divide-border md:grid-cols-4">
        {stats.map((stat, index) => (
          <div key={index} className="px-6 py-10 text-center md:px-8 md:py-12">
            <div className="text-3xl font-bold text-foreground md:text-4xl">{stat.value}</div>
            <div className="mt-1 text-sm font-medium text-foreground">{stat.label}</div>
            <div className="mt-0.5 text-xs text-muted-foreground">{stat.description}</div>
          </div>
        ))}
      </div>
    </section>
  )
}
