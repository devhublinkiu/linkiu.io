<?php

namespace App\Http\Requests\Blogs;

class UpdateBlogPostRequest extends BaseBlogPostRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('blogs.editar') ?? false;
    }

    protected function slugUniqueRule(): string
    {
        $postId = $this->route('post')?->id;
        return "unique:blog_posts,slug,{$postId}";
    }
}
