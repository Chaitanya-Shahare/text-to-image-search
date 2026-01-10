import Link from 'next/link';

export default function Navbar() {
  return (
    <nav>
      <Link href="/" className="logo">
        AutoSearch.ai
      </Link>
      <div>
        <Link href="/">Search</Link>
        <Link href="/admin">Admin Upload</Link>
      </div>
    </nav>
  );
}
