import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { Blog } from './pages/Blog';
import { PostDetail } from './pages/PostDetail';
import { AnimeList } from './pages/Anime';
import { Friends } from './pages/Friends';

export default function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/tag/:tag" element={<Blog />} />
          <Route path="/blog/:id" element={<PostDetail />} />
          <Route path="/anime" element={<AnimeList />} />
          <Route path="/friends" element={<Friends />} />
        </Routes>
      </Layout>
    </Router>
  );
}
