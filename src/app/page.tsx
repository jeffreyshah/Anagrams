import Link from 'next/link';
import './style.css'

export default function Home() {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>SCRAMBLED!</title>
        <script src="script.js" defer></script>
      </head>
      <body>
        <div className="container">
          <h1 className="game-title">
            SCRAMB<span className="tilted-letter">L</span>ED
            <div className="button-container">
              <Link href="/game" className="game-button" id="play-button">Play</Link>
              <Link href="/" className="game-button" id="join-button">Join</Link>
            </div>
          </h1>
        </div>
      </body>
    </html>
  );
}