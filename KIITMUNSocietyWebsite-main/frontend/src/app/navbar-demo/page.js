"use client";
import ResizableHeader from "@/components/ResizableHeader";
import { AuthProvider } from "@/contexts/AuthContext";

export default function NavbarDemoPage() {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Resizable Navbar */}
        <ResizableHeader />
        
        {/* Demo Content */}
        <div className="pt-32">
          <div className="container mx-auto px-4 py-8">
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Resizable Navbar Demo
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
                Scroll down to see the navbar resize and transform into a more compact form
              </p>
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6 max-w-4xl mx-auto">
                <h2 className="text-2xl font-semibold text-blue-900 dark:text-blue-100 mb-4">
                  How it works:
                </h2>
                <ul className="text-left text-blue-800 dark:text-blue-200 space-y-2">
                  <li>• When you scroll down 100px, the navbar becomes compact and resizes to 40% width on desktop</li>
                  <li>• The navbar gets a blur effect and shadow for better visibility</li>
                  <li>• On mobile, it adapts to 90% width and maintains responsiveness</li>
                  <li>• All your existing authentication logic is preserved</li>
                  <li>• Smooth animations powered by Framer Motion</li>
                </ul>
              </div>
            </div>

            {/* Scrollable Content */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {[
                { title: "Model United Nations", desc: "Experience international diplomacy" },
                { title: "Leadership Development", desc: "Build essential leadership skills" },
                { title: "Public Speaking", desc: "Master the art of communication" },
                { title: "Global Awareness", desc: "Understand world affairs" },
                { title: "Critical Thinking", desc: "Develop analytical skills" },
                { title: "Networking", desc: "Connect with like-minded peers" },
              ].map((item, idx) => (
                <div key={idx} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                    {item.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>

            {/* More content to enable scrolling */}
            <div className="space-y-8">
              {[1, 2, 3, 4, 5].map((section) => (
                <section key={section} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                    Section {section}: About KIIT MUN Society
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                        The KIIT Model United Nations Society is a premier student organization dedicated to 
                        fostering diplomatic skills, international awareness, and leadership development among 
                        students. Through engaging simulations of United Nations proceedings, we provide a 
                        platform for intellectual growth and global understanding.
                      </p>
                      <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                        Our society organizes various events throughout the year, including conferences, 
                        workshops, and training sessions to help students develop their skills in public 
                        speaking, negotiation, and critical thinking.
                      </p>
                    </div>
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-3">
                        Key Features:
                      </h3>
                      <ul className="text-blue-800 dark:text-blue-200 space-y-2">
                        <li>• Regular MUN conferences</li>
                        <li>• Leadership workshops</li>
                        <li>• International collaborations</li>
                        <li>• Skill development programs</li>
                      </ul>
                    </div>
                  </div>
                </section>
              ))}
            </div>

            {/* Final section */}
            <div className="mt-16 text-center">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg p-8 text-white">
                <h2 className="text-3xl font-bold mb-4">Ready to Join Us?</h2>
                <p className="text-xl mb-6">
                  Experience the resizable navbar as you scroll through this demo page
                </p>
                <button className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
                  Get Started
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AuthProvider>
  );
}
