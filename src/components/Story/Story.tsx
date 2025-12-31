import { Link } from 'react-router-dom';
import styles from './Story.module.css';

export function Story() {
  return (
    <div className={styles.container}>
      <article className={styles.monologue}>
        <p>this application wasn't that big when conceptualized.</p>

        <p><a href="https://neal.fun" target="_blank" rel="noopener noreferrer" className={styles.link}>neal's</a> formula already worked. this app is just a medium where people can create more like that.</p>

        <p>being developed in a hackathon, the primary objective was to get it <strong>WORKING</strong>.</p>

        <p>people should be able to create their own.</p>

        <p>and it was simpler then. just create, that's it.</p>

        <p className={styles.dim}>no timer, no IP restriction, no analytics. just simple.</p>

        <p>and <strong>MORE OVER</strong>, I was glad. i built something <em>I used</em>.</p>

        <p>for the next couple of days i played with it. started fights between topics.</p>

        <p>like i dropped a message about a poll between monkeytype and 10fastfingers in their discord.</p>

        <p>people were in the game within seconds, supporting their sides.</p>

        <p>and it was <strong>FUN</strong> to watch. something you built being used.</p>

        <p className={styles.highlight}>THIS IS MY HIGH.</p>

        <p>down the lane, usage dropped.</p>

        <p>but i still wanted to launch on PH. and maybe reach <a href="https://neal.fun" target="_blank" rel="noopener noreferrer" className={styles.link}>neal</a> as well, who knows.</p>

        <p>the current version has a paid plan ($1), IP restriction, timer, and much more.</p>

        <p>it's more like a full fledged SaaS-ish product now.</p>

        <p className={styles.dim}>15 mins before launch</p>

        <p>and <strong>IT WAS A FUN RIDE</strong></p>

        <p className={styles.fin}>fin.</p>

        <Link to="/" className={styles.back}>back home</Link>
      </article>
    </div>
  );
}
