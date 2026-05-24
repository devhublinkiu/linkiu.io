<?php

namespace App\Actions\Blogs;

use App\Models\BlogPost;
use Illuminate\Support\Facades\Storage;

class DeleteBlogPost
{
    public function execute(BlogPost $post): void
    {
        if ($post->imagen_destacada_path) {
            Storage::disk('s3')->delete($post->imagen_destacada_path);
        }

        $post->delete();
    }
}
