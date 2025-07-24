import React, { useState } from 'react';
import emailjs from '@emailjs/browser';

const Career: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    position: '',
    message: '',
    cv: null as File | null,
  });

  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, cv: e.target.files?.[0] || null });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setSending(true);
    setSuccess(null);
    setError(null);

    try {
      let cvBase64 = null;

      if (formData.cv) {
        const toBase64 = (file: File) =>
          new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = (error) => reject(error);
          });

        cvBase64 = await toBase64(formData.cv);
      }

      const templateParams = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        position: formData.position,
        message: formData.message,
        cv: cvBase64,
      };

      // Your EmailJS service info
      const serviceID = 'service_anpa0zv';
      const templateID = 'template_6oa57qr';
      const publicKey = 'X1AOdjNG_v4o0ZUC6';

      await emailjs.send(serviceID, templateID, templateParams, publicKey);

      setSuccess('Application submitted successfully!');
      setFormData({
        name: '',
        email: '',
        phone: '',
        position: '',
        message: '',
        cv: null,
      });
    } catch (err) {
      setError('Failed to send application. Please try again.');
      console.error(err);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="container my-10 px-4 py-10 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:space-x-16">
        {/* Left - Detailed Description */}
        <div className="md:w-1/2 mb-10 md:mb-0 flex flex-col justify-center">
          <h1 className="text-4xl font-bold mb-6">Join Our Team</h1>
          <p className="text-gray-700 text-lg leading-relaxed">
            At Logivis Automotive, we are always on the lookout for passionate
            individuals to drive the future of automotive innovation. Join us to
            be part of a forward-thinking company where your talents will be
            valued and your career growth supported. We offer exciting
            opportunities, a collaborative environment, and a chance to make a
            real impact in the automotive industry.
            <br />
            <br />
            Submit your application below and start your journey with us!
          </p>
        </div>

        {/* Right - Form */}
        <div className="md:w-1/2 bg-white p-8 rounded border">
          <h2 className="text-2xl font-semibold mb-6">Job Application Form</h2>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block font-medium mb-1">Full Name</label>
              <input
                name="name"
                type="text"
                required
                className="w-full border px-4 py-2 rounded"
                value={formData.name}
                onChange={handleChange}
                disabled={sending}
              />
            </div>

            <div>
              <label className="block font-medium mb-1">Email</label>
              <input
                name="email"
                type="email"
                required
                className="w-full border px-4 py-2 rounded"
                value={formData.email}
                onChange={handleChange}
                disabled={sending}
              />
            </div>

            <div>
              <label className="block font-medium mb-1">Phone</label>
              <input
                name="phone"
                type="tel"
                required
                className="w-full border px-4 py-2 rounded"
                value={formData.phone}
                onChange={handleChange}
                disabled={sending}
              />
            </div>

            <div>
              <label className="block font-medium mb-1">
                Position Applying For
              </label>
              <select
                name="position"
                required
                className="w-full border px-4 py-2 rounded"
                value={formData.position}
                onChange={handleChange}
                disabled={sending}
              >
                <option value="">Select a role</option>
                <option value="Sales Executive">Sales Executive</option>
                <option value="Service Advisor">Service Advisor</option>
                <option value="Workshop Manager">Workshop Manager</option>
                <option value="Technician">Technician</option>
                <option value="Intern">Intern</option>
              </select>
            </div>

            <div>
              <label className="block font-medium mb-1">
                Message (Optional)
              </label>
              <textarea
                name="message"
                rows={4}
                className="w-full border px-4 py-2 rounded"
                value={formData.message}
                onChange={handleChange}
                disabled={sending}
              />
            </div>

            <div>
              <label className="block font-medium mb-1">
                Upload CV (PDF/DOC) (Optional)
              </label>
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={handleFileChange}
                className="w-full"
                disabled={sending}
              />
            </div>

            {error && <p className="text-red-600 font-semibold">{error}</p>}
            {success && (
              <p className="text-green-600 font-semibold">{success}</p>
            )}

            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded"
              disabled={sending}
            >
              {sending ? 'Sending...' : 'Submit Application'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Career;
