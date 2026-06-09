import { useEffect, useRef, useState } from 'react'

const SENTENCES = [
  "Andrew Weitzel is a Creative Director, illustrator, graphic artist, and full-stack developer with over two decades of experience.",
  "He thrives within the intersection of design, technology, and brand marketing. Equally fluent in print and pixels — bringing a rare combination of visual arts sensibility and engineering depth to every brand.",
  "As CCO / Creative Director and co-founder of Box Creative — the design and digital studio he founded with his twin brother — Andrew has led creative for Fortune 50 giants and scrappy startups alike.",
  "His vast clientele include Adidas, Amazon, GM, LG, MoMA, JP Morgan, MTV, Pepsi, and E.L.F. Cosmetics to name a few.",
]

const CHAR_DELAY = 7
const PAUSE_DURATION = 7000

export default function IntroTypewriter({ active }) {
  const [text, setText] = useState('')
  const [sentenceIdx, setSentenceIdx] = useState(0)
  const [charIdx, setCharIdx] = useState(0)
  const [isPausing, setIsPausing] = useState(false)
  const timerRef = useRef(null)

  // Reset to beginning when deactivated
  useEffect(() => {
    if (!active) {
      clearTimeout(timerRef.current)
      setText('')
      setSentenceIdx(0)
      setCharIdx(0)
      setIsPausing(false)
    }
  }, [active])

  // Typewriter loop
  useEffect(() => {
    if (!active) return
    const sentence = SENTENCES[sentenceIdx]

    if (isPausing) {
      timerRef.current = setTimeout(() => {
        setText('')
        setCharIdx(0)
        setSentenceIdx(i => (i + 1) % SENTENCES.length)
        setIsPausing(false)
      }, PAUSE_DURATION)
      return () => clearTimeout(timerRef.current)
    }

    if (charIdx < sentence.length) {
      timerRef.current = setTimeout(() => {
        setText(sentence.slice(0, charIdx + 1))
        setCharIdx(c => c + 1)
      }, CHAR_DELAY)
      return () => clearTimeout(timerRef.current)
    }

    setIsPausing(true)
  }, [active, sentenceIdx, charIdx, isPausing])

  return (
    <div
      className={`fixed bottom-0 left-0 z-20 px-8 pb-8 w-full md:w-3/4 pointer-events-none transition-opacity duration-700 ${
        active ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <p
        className="text-white text-4xl md:text-5xl leading-tight"
        style={{ fontFamily: '"new-spirit-condensed", serif', fontWeight: 400 }}
      >
        {text}
      </p>
    </div>
  )
}
