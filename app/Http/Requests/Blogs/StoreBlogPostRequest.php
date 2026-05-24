<?php

namespace App\Http\Requests\Blogs;

class StoreBlogPostRequest extends BaseBlogPostRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('blogs.crear') ?? false;
    }

    protected function slugUniqueRule(): string
    {
        return 'unique:blog_posts,slug';
    }
}
