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
          <div className="book-grid grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {datas.map((item, index) => (
              <article
                className="book-card group overflow-hidden"
                key={item.id || index}
              >
                {item.image ? (
                  <img
                    className="book-cover h-60 w-full object-cover transition duration-500 group-hover:scale-105"
                    src={item.image}
                    alt={item.title}
                  />
                ) : (
                  <div className="book-cover flex h-60 items-center justify-center text-sm font-medium">
                    No cover image
                  </div>
                )}
                <div className="p-5">
                  <div className="mb-3 flex items-start justify-between gap-3">
                    <h2 className="book-title">{item.title}</h2>
                    <span className="book-year shrink-0">
                      {item.year}
                    </span>
                  </div>
                  <p className="book-author mb-3">
                    By {item.author}
                  </p>
                  <span className="book-genre inline-block">
                    {item.genre}
                  </span>
                  <p className="book-description mt-4 line-clamp-3">
                    {item.desc}
                  </p>
                  <div className="book-actions mt-5 flex gap-2">
                    <Popconfirm
                      title="Do you really want to delete this book?"
                      onConfirm={() => delete_function(item.id)}
                      okText="Delete"
                      cancelText="Cancel"
                    >
                      <Button
                        danger
                        type="default"
                        loading={deletingId === item.id}
                      >
                        Delete
                      </Button>
                    </Popconfirm>
                    <Button type="primary" onClick={() => edit_open(item)}>
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