import axios from 'axios';
import { Button, Form, Input, InputNumber, message, Modal, Popconfirm, } from 'antd';
import { useEffect, useState } from 'react';

interface PostValues {
  id?: string;
  title: string;
  author: string;
  genre: string;
  year: number;
  desc: string;
  image: string;
}

export default function Library() {
  const [form] = Form.useForm<PostValues>();
  const [editForm] = Form.useForm<PostValues>();

  const [datas, setdatas] = useState<PostValues[]>([]);

  const [postmodal, setpostmodal] = useState(false);
  const [editmodal, seteditmodal] = useState(false);
  const [viewBook, setViewBook] = useState<PostValues | null>(null);
  const [createLoading, setCreateLoading] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string>();

  const modal_open = () => {
    setpostmodal(true);
  };

  const edit_open = (item: PostValues) => {
    if (!item.id) {
      message.error('Cannot edit a post without an id');
      return;
    }

    editForm.setFieldsValue(item);
    seteditmodal(true);
  };

  const fetchData = async () => {
    try {
      const response = await axios.get<PostValues[]>(
        'https://6ab365cb217e43658830f0ef.mockapi.io/Book-borrow',
      );
      setdatas(response.data);
    } catch (error) {
      console.error('Fetch failed:', error);
      message.error('Failed to load posts');
    }
  };

  useEffect(() => {
    fetchData();
  }, []);
  const delete_function = async (id?: string) => {
    if (!id) {
      message.error('Cannot delete a post without an id');
      return;
    }

    setDeletingId(id);
    try {
      await axios.delete(
        `https://6ab365cb217e43658830f0ef.mockapi.io/Book-borrow/${id}`,
      );
      message.success('Data deleted successfully');
      await fetchData();
    } catch (error) {
      console.error('Delete failed:', error);
      message.error('Failed to delete');
    } finally {
      setDeletingId(undefined);
    }
  };
  const send = async (values: PostValues) => {
    setCreateLoading(true);
    try {
      await axios.post(
        'https://6ab365cb217e43658830f0ef.mockapi.io/Book-borrow',
        values,
      );
      message.success('Post created successfully');
      setpostmodal(false);
      form.resetFields();
      await fetchData();
    } catch (error) {
      console.error('Error creating post:', error);
      message.error('Failed to create post');
    } finally {
      setCreateLoading(false);
    }
  };

  const update_post = async (values: PostValues) => {
    if (!values.id) {
      message.error('Cannot update a post without an id');
      return;
    }

    setEditLoading(true);
    try {
      await axios.put(
        `https://6ab365cb217e43658830f0ef.mockapi.io/Book-borrow/${values.id}`,
        values,
      );
      message.success('Post updated successfully');
      seteditmodal(false);
      editForm.resetFields();
      await fetchData();
    } catch (error) {
      console.error('Update failed:', error);
      message.error('Failed to update post');
    } finally {
      setEditLoading(false);
    }
  };

  return (

    <main className="post-page">
      <div className="mx-auto max-w-6xl">
        <div className="library-header mb-10 flex items-end justify-between gap-4">
          <div>
            <p className="eyebrow mb-2">
              Library Colection
            </p>
            <h1 className="library-title">Lended Book</h1>
          </div>
          <Button className="new-post-button" onClick={modal_open}>New Post</Button>
        </div>

        {datas.length > 0 ? (
          <div className="book-grid grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {datas.map((item, index) => (
              <article
                className="book-card group overflow-hidden"
                key={item.id || index}
              >
                <div className="book-cover-wrap">
                  {item.image ? (
                    <img
                      className="book-cover h-full w-full object-cover transition duration-500 group-hover:scale-105"
                      src={item.image}
                      alt={item.title}
                    />
                  ) : (
                    <div className="book-cover flex h-full w-full items-center justify-center text-sm font-medium">
                      No cover image
                    </div>
                  )}
                  <div className="book-cover-overlay">
                    <span className="book-genre book-genre-overlay">
                      {item.genre}
                    </span>
                    <h2 className="book-title book-cover-title">{item.title}</h2>
                  </div>
                </div>
                <div className="p-4">
                  <div className="mb-2 flex justify-end">
                    <span className="book-year shrink-0">
                      {item.year}
                    </span>
                  </div>
                  <p className="book-author mb-2">
                    By {item.author}
                  </p>
                  <p className="book-description mt-3 line-clamp-2">
                    {item.desc}
                  </p>
                  <div className="book-actions mt-4 flex gap-2">
                    <Button size="small" className="view-button" onClick={() => setViewBook(item)}>
                      View
                    </Button>
                    <Popconfirm
                      overlayClassName="book-delete-confirm"
                      title="Do you really want to delete this book?"
                      onConfirm={() => delete_function(item.id)}
                      okText="Delete"
                      cancelText="Cancel"
                    >
                      <Button
                        size="small"
                        danger
                        type="default"
                        loading={deletingId === item.id}
                      >
                        Delete
                      </Button>
                    </Popconfirm>
                    <Button size="small" type="primary" onClick={() => edit_open(item)}>
                      Edit
                    </Button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="empty-state rounded-2xl px-6 py-16 text-center">
            <h2 className="text-lg font-semibold">No posts yet</h2>
            <p className="mt-2 text-sm">Create your first book post to see it here.</p>
          </div>
        )}
      </div>
      <Modal
        className="book-details-modal"
        open={viewBook !== null}
        title={<span className="sr-only">{viewBook?.title}</span>}
        onCancel={() => setViewBook(null)}
        footer={
          <Button
            className="book-details-close-button"
            type="primary"
            onClick={() => setViewBook(null)}
          >
            Close
          </Button>
        }
      >
        {viewBook && (
          <div className="book-details">
            <div className="book-details-cover-wrap">
              {viewBook.image ? (
                <img
                  className="book-details-cover"
                  src={viewBook.image}
                  alt={viewBook.title}
                />
              ) : (
                <div className="book-cover book-details-cover-placeholder">
                  No cover image
                </div>
              )}
              <div className="book-cover-overlay">
                <span className="book-genre book-genre-overlay">
                  {viewBook.genre}
                </span>
                <h2 className="book-title book-cover-title book-details-image-title">
                  {viewBook.title}
                </h2>
              </div>
            </div>
            <p><strong>Author:</strong> {viewBook.author}</p>
            <p><strong>Year:</strong> {viewBook.year}</p>
            {viewBook.id && <p><strong>ID:</strong> {viewBook.id}</p>}
            <p><strong>Description:</strong></p>
            <p className="book-details-description">{viewBook.desc}</p>
          </div>
        )}
      </Modal>
      <Modal
      open={postmodal}
        onCancel={() => setpostmodal(false)}
        footer={null}
      >
      <Form
        form={form}
        layout="vertical"
        className="post-form"
        onFinish={send}
      >
        <h1>Create a Post</h1>

        <Form.Item name="title" label="Title" rules={[{ required: true }]}>
          <Input placeholder="Enter the book title" />
        </Form.Item>

        <Form.Item name="author" label="Author" rules={[{ required: true }]}>
          <Input placeholder="Enter the author" />
        </Form.Item>

        <Form.Item name="genre" label="Genre" rules={[{ required: true }]}>
          <Input placeholder="Enter the genre" />
        </Form.Item>

        <Form.Item name="year" label="Year" rules={[{ required: true }]}>
          <InputNumber min={0} max={9999} placeholder="Enter the publication year" />
        </Form.Item>

        <Form.Item name="desc" label="Description" rules={[{ required: true }]}>
          <Input.TextArea rows={4} placeholder="Write a short description" />
        </Form.Item>

        <Form.Item name="image" label="Image URL">
          <Input placeholder="https://example.com/image.jpg" />
        </Form.Item>

        <Button type="primary" htmlType="submit" block loading={createLoading}>
          Create Post
        </Button>
      </Form>
      </Modal>
      <Modal
        open={editmodal}
        onCancel={() => seteditmodal(false)}
        footer={null}
      >
        <Form
          form={editForm}
          layout="vertical"
          className="post-form"
          onFinish={update_post}
        >
          <h1>Edit Post</h1>

          <Form.Item name="id" hidden>
            <Input />
          </Form.Item>

          <Form.Item name="title" label="Title" rules={[{ required: true }]}>
            <Input placeholder="Enter the book title" />
          </Form.Item>

          <Form.Item name="author" label="Author" rules={[{ required: true }]}>
            <Input placeholder="Enter the author" />
          </Form.Item>

          <Form.Item name="genre" label="Genre" rules={[{ required: true }]}>
            <Input placeholder="Enter the genre" />
          </Form.Item>

          <Form.Item name="year" label="Year" rules={[{ required: true }]}>
            <InputNumber min={0} max={9999} placeholder="Enter the publication year" />
          </Form.Item>

          <Form.Item name="desc" label="Description" rules={[{ required: true }]}>
            <Input.TextArea rows={4} placeholder="Write a short description" />
          </Form.Item>

          <Form.Item name="image" label="Image URL">
            <Input placeholder="https://example.com/image.jpg" />
          </Form.Item>

          <Button type="primary" htmlType="submit" block loading={editLoading}>
            Save Changes
          </Button>
        </Form>
      </Modal>
    </main>
  );
}