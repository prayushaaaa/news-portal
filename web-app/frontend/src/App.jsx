import { Route, Routes, BrowserRouter } from "react-router-dom";
import Index from "./views/core/Index";
import Detail from "./views/core/Detail";
import Search from "./views/core/Search";
import Category from "./views/core/Category";
import About from "./views/pages/About";
import Contact from "./views/pages/Contact";
import Register from "./views/auth/Register";
import Login from "./views/auth/Login";
import Logout from "./views/auth/Logout";
import ForgotPassword from "./views/auth/ForgotPassword";
import CreatePassword from "./views/auth/CreatePassword";
import Dashboard from "./views/dashboard/Dashboard";
import Posts from "./views/dashboard/Posts";
import AddPost from "./views/dashboard/AddPost";
import EditPost from "./views/dashboard/EditPost";
import Comments from "./views/dashboard/Comments";
import Notifications from "./views/dashboard/Notifications";
import EditProfile from "./views/dashboard/EditProfile";
import MainWrapper from "../src/layouts/MainWrapper";
import ViewBookmarks from "./views/dashboard/ViewBookmarks";
import NewsDetail from "./views/core/NewsDetail";

function App() {
  return (
    <>
      <BrowserRouter>
        <MainWrapper>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/blog-detail/:slug/" element={<Detail />} />
            {/* <Route path="/news-detail/:id/" element={<Detail />} /> // needs work */}
            <Route path="/category/:category/" element={<Category />} />
            <Route path="/search/" element={<Search />} />

            {/* Authentication */}
            <Route path="/register/" element={<Register />} />
            <Route path="/login/" element={<Login />} />
            <Route path="/logout/" element={<Logout />} />
            <Route path="/forgot-password/" element={<ForgotPassword />} />
            <Route path="/create-password/" element={<CreatePassword />} />

            {/* Dashboard */}
            <Route path="/dashboard/" element={<Dashboard />} />
            <Route path="/posts/" element={<Posts />} />
            <Route path="/add-post/" element={<AddPost />} />
            <Route path="/edit-post/:id/" element={<EditPost />} />
            <Route path="/comments/" element={<Comments />} />
            <Route path="/notifications/" element={<Notifications />} />
            <Route path="/edit-profile/" element={<EditProfile />} />
            <Route path="/view-bookmarks/:userId" element={<ViewBookmarks />} />


            {/* Pages */}
            <Route path="/about/" element={<About />} />
            <Route path="/contact/" element={<Contact />} />

            <Route path="/news-detail/:news_article_id" element={<NewsDetail />} />
          </Routes>
        </MainWrapper>
      </BrowserRouter>
    </>
  );
}

export default App;