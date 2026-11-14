const questions = [
  {
    question: "دَرِت چیه؟",
    answer:
      "کلکسیونی بی‌نظیر از در های دست‌ساز باکیفیت و شاهکار جهت ارائه به افرادی که نیازه در اسرع وقت درشون رو بذارن.",
  },
  {
    question: "«درت رو بذار» یعنی چی؟",
    answer:
      "یه تیکه‌ی خودمونی، یعنی دیگه بسه، ساکت شو. دَرِت فقط کمکت می‌کنه این کار رو با باکلاس‌ترین در ممکن انجام بدی.",
  },
  {
    question: "بعدش چی؟",
    answer: "بعد از گذاشتن درتون، اگه هنوز از جمع خارج نشدید، به leftbede.ir مراجعه بفرمایید و لفت بدید.",
  },
];

/** A few plain answers under the grid: what the site is, for people and for search engines. */
export function About() {
  return (
    <section aria-labelledby="about-title" className="mt-10 flex flex-col gap-6">
      <h2 id="about-title" className="text-2xl font-black md:text-3xl">
        درباره‌ی دَرِت
      </h2>
      <dl className="grid border-s border-t md:grid-cols-3">
        {questions.map(({ question, answer }) => (
          <div key={question} className="flex flex-col gap-3 border-e border-b p-6 md:p-8">
            <dt className="font-bold">{question}</dt>
            <dd className="text-sm/loose text-muted-foreground">{answer}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
