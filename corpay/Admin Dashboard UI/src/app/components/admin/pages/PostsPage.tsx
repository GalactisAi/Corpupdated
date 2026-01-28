import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Textarea } from '../../ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../ui/table';
import { postsService } from '@/app/services/apiService';
import { toast } from 'sonner';
import { Plus, Edit, Trash2, ImageIcon, RefreshCw } from 'lucide-react';

interface Post {
  id: string;
  title: string;
  content: string;
  image?: string;
  type: 'linkedin' | 'crossBorder';
  createdAt: string;
}

export function PostsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoadingPosts, setIsLoadingPosts] = useState(false);
  const [useApiPosts, setUseApiPosts] = useState(true);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    type: 'linkedin' as 'linkedin' | 'crossBorder',
    image: ''
  });

  // Load posts from API on mount
  useEffect(() => {
    if (useApiPosts) {
      loadPostsFromAPI();
    }
  }, [useApiPosts]);

  const loadPostsFromAPI = async () => {
    setIsLoadingPosts(true);
    try {
      const apiPosts = await postsService.getPosts();
      if (apiPosts.length > 0) {
        setPosts(apiPosts);
        toast.success(`Loaded ${apiPosts.length} post(s) from API`);
      } else {
        toast.info('No posts found from API. You can create posts manually.');
      }
    } catch (error) {
      toast.error('Failed to load posts from API');
    } finally {
      setIsLoadingPosts(false);
    }
  };

  const handleSubmit = async () => {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));

      if (editingPost) {
        // PUT /api/admin/posts
        setPosts(posts.map(p => 
          p.id === editingPost.id 
            ? { ...p, ...formData, updatedAt: new Date().toISOString() }
            : p
        ));
        toast.success('Post updated successfully');
      } else {
        // POST /api/admin/posts
        const newPost: Post = {
          id: Date.now().toString(),
          ...formData,
          createdAt: new Date().toISOString()
        };
        setPosts([newPost, ...posts]);
        toast.success('Post created successfully');
      }

      setIsDialogOpen(false);
      setEditingPost(null);
      setFormData({ title: '', content: '', type: 'linkedin', image: '' });
    } catch (error) {
      toast.error('Operation failed');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      // DELETE /api/admin/posts/{id}
      setPosts(posts.filter(p => p.id !== id));
      toast.success('Post deleted successfully');
    } catch (error) {
      toast.error('Delete failed');
    }
  };

  const handleEdit = (post: Post) => {
    setEditingPost(post);
    setFormData({
      title: post.title,
      content: post.content,
      type: post.type,
      image: post.image || ''
    });
    setIsDialogOpen(true);
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setEditingPost(null);
    setFormData({ title: '', content: '', type: 'linkedin', image: '' });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl text-white mb-2">Posts Management</h1>
          <p className="text-gray-400">Manage LinkedIn and Cross-Border posts from API or manually</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={loadPostsFromAPI}
            disabled={isLoadingPosts || !useApiPosts}
            className="bg-white/10 border-white/20 text-white hover:bg-white/20 hover:border-white/30 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoadingPosts ? 'animate-spin' : ''}`} />
            Refresh from API
          </Button>
          <Button
            variant="outline"
            onClick={() => setUseApiPosts(!useApiPosts)}
            className="bg-white/10 border-white/20 text-white hover:bg-white/20 hover:border-white/30"
          >
            {useApiPosts ? 'Switch to Manual' : 'Switch to API'}
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-pink-600 hover:bg-pink-700">
              <Plus className="w-4 h-4 mr-2" />
              Create Post
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-[#3d0f1f] border-white/20 text-white max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingPost ? 'Edit Post' : 'Create New Post'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>Post Type</Label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                  className="w-full px-3 py-2 rounded-md bg-white/10 border border-white/20 text-white"
                >
                  <option value="linkedin">LinkedIn Post</option>
                  <option value="crossBorder">Cross-Border Post</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label>Title</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Post title"
                  className="bg-white/10 border-white/20 text-white"
                />
              </div>

              <div className="space-y-2">
                <Label>Content</Label>
                <Textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Post content..."
                  rows={4}
                  className="bg-white/10 border-white/20 text-white"
                />
              </div>

              <div className="space-y-2">
                <Label>Image URL (optional)</Label>
                <Input
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  placeholder="https://..."
                  className="bg-white/10 border-white/20 text-white"
                />
              </div>

              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={handleDialogClose} className="border-white/20">
                  Cancel
                </Button>
                <Button onClick={handleSubmit} className="bg-pink-600 hover:bg-pink-700">
                  {editingPost ? 'Update' : 'Create'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
        </div>
      </div>

      <Card className="bg-white/10 border-white/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-white">All Posts</CardTitle>
              <CardDescription className="text-gray-400">
                {posts.length} total posts {useApiPosts ? '(from API)' : '(manual)'}
              </CardDescription>
            </div>
            {useApiPosts && (
              <div className="flex items-center gap-2">
                <span className="px-2 py-1 rounded text-xs bg-blue-500/20 text-blue-300">
                  API Mode
                </span>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {isLoadingPosts ? (
            <div className="flex items-center justify-center p-8">
              <RefreshCw className="w-6 h-6 text-pink-500 animate-spin mr-2" />
              <span className="text-white">Loading posts from API...</span>
            </div>
          ) : (
          <Table>
            <TableHeader>
              <TableRow className="border-white/10 hover:bg-white/5">
                <TableHead className="text-gray-300">Type</TableHead>
                <TableHead className="text-gray-300">Title</TableHead>
                <TableHead className="text-gray-300">Content</TableHead>
                <TableHead className="text-gray-300">Created</TableHead>
                <TableHead className="text-gray-300 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {posts.map((post) => (
                <TableRow key={post.id} className="border-white/10 hover:bg-white/5">
                  <TableCell className="text-white">
                    <span className={`px-2 py-1 rounded text-xs ${
                      post.type === 'linkedin' ? 'bg-blue-500/20 text-blue-300' : 'bg-green-500/20 text-green-300'
                    }`}>
                      {post.type === 'linkedin' ? 'LinkedIn' : 'Cross-Border'}
                    </span>
                  </TableCell>
                  <TableCell className="text-white">{post.title}</TableCell>
                  <TableCell className="text-gray-400 max-w-md truncate">{post.content}</TableCell>
                  <TableCell className="text-gray-400">{post.createdAt}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-2 justify-end">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleEdit(post)}
                        className="text-gray-400 hover:text-white"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleDelete(post.id)}
                        className="text-red-400 hover:text-red-300"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
