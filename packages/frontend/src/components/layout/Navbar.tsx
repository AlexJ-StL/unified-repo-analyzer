import { Menu, Transition } from "@headlessui/react";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import { Fragment } from "react";
import { Link } from "react-router-dom";

const Navbar = () => {
	return (
		<nav className="bg-white shadow-sm">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="flex justify-between h-16">
					<div className="flex">
						<div className="flex-shrink-0 flex items-center">
							<Link to="/" className="text-xl font-bold text-gray-900">
								Unified Repository Analyzer
							</Link>
						</div>
					</div>
					<div className="hidden sm:ml-6 sm:flex sm:items-center sm:space-x-4">
						<Link
							to="/"
							className="px-3 py-2 rounded-md text-sm font-medium text-gray-900 hover:bg-gray-100"
						>
							Home
						</Link>
						<Link
							to="/analyze"
							className="px-3 py-2 rounded-md text-sm font-medium text-gray-900 hover:bg-gray-100"
						>
							Analyze
						</Link>
						<Link
							to="/repositories"
							className="px-3 py-2 rounded-md text-sm font-medium text-gray-900 hover:bg-gray-100"
						>
							Repositories
						</Link>
						<Link
							to="/settings"
							className="px-3 py-2 rounded-md text-sm font-medium text-gray-900 hover:bg-gray-100"
						>
							Settings
						</Link>
					</div>
					<div className="flex items-center sm:hidden">
						<Menu as="div" className="relative inline-block text-left">
							<div>
								<Menu.Button className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500">
									{({ open }) => (
										<>
											<span className="sr-only">Open main menu</span>
											{open ? (
												<XMarkIcon
													className="block h-6 w-6"
													aria-hidden="true"
												/>
											) : (
												<Bars3Icon
													className="block h-6 w-6"
													aria-hidden="true"
												/>
											)}
										</>
									)}
								</Menu.Button>
							</div>
							<Transition
								as={Fragment}
								enter="transition ease-out duration-100"
								enterFrom="transform opacity-0 scale-95"
								enterTo="transform opacity-100 scale-100"
								leave="transition ease-in duration-75"
								leaveFrom="transform opacity-100 scale-100"
								leaveTo="transform opacity-0 scale-95"
							>
								<Menu.Items className="absolute right-0 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
									<div className="py-1">
										<Menu.Item>
											{({ active }) => (
												<Link
													to="/"
													className={`${
														active
															? "bg-gray-100 text-gray-900"
															: "text-gray-700"
													} block px-4 py-2 text-sm`}
												>
													Home
												</Link>
											)}
										</Menu.Item>
										<Menu.Item>
											{({ active }) => (
												<Link
													to="/analyze"
													className={`${
														active
															? "bg-gray-100 text-gray-900"
															: "text-gray-700"
													} block px-4 py-2 text-sm`}
												>
													Analyze
												</Link>
											)}
										</Menu.Item>
										<Menu.Item>
											{({ active }) => (
												<Link
													to="/repositories"
													className={`${
														active
															? "bg-gray-100 text-gray-900"
															: "text-gray-700"
													} block px-4 py-2 text-sm`}
												>
													Repositories
												</Link>
											)}
										</Menu.Item>
										<Menu.Item>
											{({ active }) => (
												<Link
													to="/settings"
													className={`${
														active
															? "bg-gray-100 text-gray-900"
															: "text-gray-700"
													} block px-4 py-2 text-sm`}
												>
													Settings
												</Link>
											)}
										</Menu.Item>
									</div>
								</Menu.Items>
							</Transition>
						</Menu>
					</div>
				</div>
			</div>
		</nav>
	);
};

export default Navbar;
