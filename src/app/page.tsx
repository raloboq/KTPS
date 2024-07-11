/*import Link from 'next/link'
export default function Page() {
    return (
    <>
    <h1>Hello, TKPS</h1>
    <Link href="/think">Think</Link>
    </>)
    
  }*/
    

      'use client';

     import styles from './styles.module.css';
      import Link from 'next/link';
      import { useState } from 'react';
      import { useRouter } from 'next/navigation';
      
      export default function Page() {
        const [text1, setText1] = useState('');
        const [text2, setText2] = useState('');
        const router = useRouter();
      
        /*const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
          e.preventDefault();
          console.log('Text 1:', text1);
          console.log('Text 2:', text2);
          router.push('/think');
        };*/

        const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
          e.preventDefault();
          console.log('Text 1:', text1);
          console.log('Text 2:', text2);
          
          // Encode the text to ensure special characters are properly handled in the URL
          const encodedText1 = encodeURIComponent(text1);
          router.push(`/think?alias=${encodedText1}`);
        };
      
        return (
          <div className={styles.container}>
            <h1 className={styles.title}>Bienvenid@ a Konrad Think Pair Share</h1>
            <Link href="/think" className={styles.link}>Think</Link>

            <h3 className={styles.title}>Ingresa el usuario que te fue asignado</h3>
            <form onSubmit={handleSubmit} className={styles.form}>
              <input
                type="text"
                placeholder="Enter text 1"
                value={text1}
                onChange={(e) => setText1(e.target.value)}
                className={styles.input}
              />
              <input
                type="text"
                placeholder="Enter text 2"
                value={text2}
                onChange={(e) => setText2(e.target.value)}
                className={styles.input}
              />
              <button type="submit" className={styles.button}>Submit</button>
            </form>
          </div>
        );
      }