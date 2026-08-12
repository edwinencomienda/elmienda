<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\CategoryRequest;
use App\Models\Category;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CategoryController extends Controller
{
    /**
     * List the categories.
     */
    public function index(): Response
    {
        return Inertia::render('admin/categories/index', [
            'categories' => Category::query()
                ->withCount('products')
                ->orderBy('position')
                ->orderBy('name')
                ->get()
                ->map(fn (Category $category) => [
                    'id' => $category->id,
                    'name' => $category->name,
                    'slug' => $category->slug,
                    'description' => $category->description,
                    'position' => $category->position,
                    'products_count' => $category->products_count,
                ]),
        ]);
    }

    /**
     * Store a new category.
     */
    public function store(CategoryRequest $request): RedirectResponse
    {
        Category::create([
            ...$request->validated(),
            'position' => (int) Category::max('position') + 1,
        ]);

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Category created.')]);

        return back();
    }

    /**
     * Update the given category.
     */
    public function update(CategoryRequest $request, Category $category): RedirectResponse
    {
        $category->update($request->validated());

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Category updated.')]);

        return back();
    }

    /**
     * Delete the given category. Products keep existing but lose the link.
     */
    public function destroy(Category $category): RedirectResponse
    {
        $category->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Category deleted.')]);

        return back();
    }

    /**
     * Persist a drag-and-drop reorder.
     */
    public function reorder(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'ids' => ['required', 'array'],
            'ids.*' => ['integer', 'exists:categories,id'],
        ]);

        foreach ($validated['ids'] as $position => $id) {
            Category::whereKey($id)->update(['position' => $position]);
        }

        return back();
    }
}
