from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from api import views as api_views

urlpatterns = [
    # Userauths API Endpoints
    path('user/token/', api_views.MyTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('user/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('user/register/', api_views.RegisterView.as_view(), name='auth_register'),
    path('user/profile/<user_id>/', api_views.ProfileView.as_view(), name='user_profile'),
    path('user/password-reset/<email>/', api_views.PasswordEmailVerify.as_view(), name='password_reset'),
    path('user/password-change/', api_views.PasswordChangeView.as_view(), name='password_reset'),

    # Post Endpoints
    path('post/category/list/', api_views.CategoryListAPIView.as_view()),
    path('post/category/posts/<category>/', api_views.PostCategoryListAPIView.as_view()),
    path('post/lists/', api_views.PostListAPIView.as_view()),
    path('post/detail/<slug>/', api_views.PostDetailAPIView.as_view()),
    path('post/like-post/', api_views.LikePostAPIView.as_view()),
    path('post/comment-post/', api_views.PostCommentAPIView.as_view()),
    path('post/bookmark-post/', api_views.BookmarkPostAPIView.as_view()),
    path('post/list-by-views/', api_views.PostByViewsAPIView.as_view()),
    

    # Dashboard APIS
    path('author/dashboard/stats/<user_id>/', api_views.DashboardStats.as_view()),
    path('author/dashboard/post-list/<user_id>/', api_views.DashboardPostLists.as_view()),
    path('author/dashboard/comment-list/', api_views.DashboardCommentLists.as_view()),
    path('author/dashboard/noti-list/<user_id>/', api_views.DashboardNotificationLists.as_view()),
    path('author/dashboard/noti-mark-seen/', api_views.DashboardMarkNotiSeenAPIView.as_view()),
    path('author/dashboard/reply-comment/', api_views.DashboardPostCommentAPIView.as_view()),
    path('author/dashboard/post-create/', api_views.DashboardPostCreateAPIView.as_view()),
    path('author/dashboard/post-detail/<user_id>/<post_id>/', api_views.DashboardPostEditAPIView.as_view()),
    
    #news article APIs
    path('news-article/lists/', api_views.NewsArticleListAPIView.as_view()),
    path('news-article/list-by-likes/', api_views.NewsArticleByLikesAPIView.as_view()),
    path('news-article/list-by-views/', api_views.NewsArticleByViewsAPIView.as_view()),
    path('news-article/detail/<news_article_id>/', api_views.NewsArticleDetailAPIView.as_view()),
    path('news-article/like-article/', api_views.LikeNewsArticleAPIView.as_view()),
    path('news-article/bookmark-news-article/', api_views.BookmarkNewsArticleAPIView.as_view()),
    path('news-article/comment-article/', api_views.NewsArticleCommentAPIView.as_view()),
    
    #get all bookmarks of a user
    path('all-bookmarks/<user_id>/', api_views.UserBookmarkView.as_view()),

]