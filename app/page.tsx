import Header from "./components/Header";
import SearchBar from "./components/SearchBar";
import NoteList from "./components/NoteList";
import BottomBar from "./components/BottomBar";

export default function Home() {
  return (
    <main className="min-h-screen bg-background pt-20">
      <Header />
      <NoteList />
      <BottomBar />
    </main>
  );
}