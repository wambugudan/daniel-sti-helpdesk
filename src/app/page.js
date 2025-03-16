'use client'

import Image from "next/image";
import Link from "next/link";
// import img1 from "public/assets/images/acts-logo.png";
// import logo1 from "public/assets/images/logos/1.png";
// import logo3 from "public/assets/images/logos/2.png";
// import logo2 from "public/assets/images/logos/8.png";
// import img2 from "public/assets/images/logos/new_1.png";
// import partners from "public/assets/images/logos/partner_bottom.png";
import { useState } from "react";

export default function Home() {
  const [showMore, setShowMore] = useState(false)

  // Overdidding user auth for dev purposes
  const [user, setUser] = useState(true)
  return (
    <div>
      <div className="relative mx-auto px-6 md:px-4" id="home">
        <div
          aria-hidden="true"
          className="absolute inset-0 grid grid-cols-2 -space-x-52 opacity-40"
        >
          <div className="h-56 bg-gradient-to-br from-primary to-purple-400 blur-[106px]"></div>
          <div className="h-32 bg-gradient-to-r from-cyan-400 to-sky-300 blur-[106px]"></div>
        </div>
        <div>
          <div className="relative ml-auto pt-36">
            <div className="mx-auto text-center lg:max-w-4xl">
              <h1 className="text-5xl font-black leading-tight  text-gray-900 md:text-6xl">
                Transforming STI Policy with a
                <span className="text-primary"> collaborative platform.</span>
              </h1>
              <p className="mt-8">
                This webapp has been developed to provide an opportunity to link
                African research experts in the field of science, technology and
                innovation studies (STIS) with their science granting councils.
                Specifically, the aim of this webapp is to provide science
                councils with a helpdesk function whereby they can access skills
                and expertise that they require from within the AfricaLics
                network of STIS scholars.
              </p>
              {showMore ? (
                <div>
                  <p className="mt-8 px-10 text-gray-700">
                    The app enables the councils to post short descrete research
                    and policy requests for everything from the writing of
                    policy brief to the analysis of research funding impact or
                    review of an element of sti policy or activity.
                  </p>
                  <p className="mt-8 px-10 text-gray-700">
                    The app also enables AfricaLics network scholars post their
                    profiles and expertise areas. In phase 2 the helpdesk will
                    include an online matching function. For the time being this
                    will occur offline through bilateral email exchanges between
                    councils and experts.
                  </p>
                  <p className="mt-8 px-10 text-gray-700">
                    This helpdesk has been made possible through the Science
                    Granting Councils Initiative (www.sgciafrica.org) and
                    funding provided to the African Centre for Technology
                    Studies (ACTS) to support African Science Councils with
                    support in utilising data and evidence for policy and
                    decision making.
                  </p>
                </div>
              ) : (
                ""
              )}

              <div className="mt-16 flex flex-wrap justify-center gap-y-4 gap-x-6">
                {/* I have overridden the authenticated user with a useState for dev purposes */}
                {user ? (
                  <Link
                    href="/submissions"
                    className="relative flex h-11 w-full items-center justify-center px-9 before:absolute before:inset-0 before:rounded-md before:bg-primary before:transition before:duration-300 hover:before:scale-105 active:duration-75 active:before:scale-95 sm:w-max"
                  >
                    <span className="relative text-base font-semibold text-white">
                      Go to Dashboard
                    </span>
                  </Link>
                ) : (
                  <Link
                    href="/sign-in"
                    className="relative flex h-11 w-full items-center justify-center px-9 before:absolute before:inset-0 before:rounded-md before:bg-primary before:transition before:duration-300 hover:before:scale-105 active:duration-75 active:before:scale-95 sm:w-max"
                  >
                    <span className="relative text-base font-semibold text-white">
                      Get started
                    </span>
                  </Link>
                )}

                <button
                  onClick={() => setShowMore(!showMore)}
                  className="relative flex h-11 w-full items-center justify-center px-4 before:absolute before:inset-0 before:rounded-md before:border before:border-transparent before:bg-gradient-to-b before:transition before:duration-300 hover:before:scale-105 active:duration-75 active:before:scale-95 sm:w-max"
                >
                  <span className="relative text-base font-semibold text-primary">
                    {!showMore ? "Show more" : "Show Less"}
                  </span>
                </button>
              </div>
              <div className="mt-16 hidden justify-between divide-x-2 border-y border-gray-300 py-8 ">
                <div className="text-left">
                  <h6 className="text-lg font-semibold text-gray-700">
                    Tap into the collective knowledge of top scholars and
                    experts in the STI field, accessing the latest research,
                    insights, and best practices on demand.
                  </h6>
                  <p className="mt-2 text-gray-500">
                    Access the latest STI research and insights
                  </p>
                </div>
                <div className="pl-4 text-left ">
                  <h6 className="text-lg font-semibold text-gray-700">
                    For small or large pieces of work related to STI
                    policy-making, helping you find the right information and
                    resources quickly and efficiently.
                  </h6>
                  <p className="mt-2 text-gray-500">
                    Streamline STI decision-making process
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-10 grid grid-cols-5">
              <div className="flex items-center p-4 transition duration-200 hover:grayscale">
                <Image
                  // src={logo1}
                  src= "/assets/images/logos/1.png"
                  className="mx-auto w-auto"
                  loading="lazy"
                  alt="logo"
                  width={190}
                  height={40}
                />
              </div>
              <div className="flex items-center p-4 transition duration-200 hover:grayscale">
                <Image
                  // src={img2}
                  src = "/assets/images/logos/new_1.png"
                  className="mx-auto w-auto"
                  loading="lazy"
                  alt="logo"
                  width={120}
                  height={40}
                />
              </div>
              <div className="p-4 transition duration-200 hover:grayscale">
                <Image
                  // src={img1}
                  src = "/assets/images/acts-logo.png"
                  className="mx-auto w-auto"
                  loading="lazy"
                  alt="logo"
                  width={90}
                  height={40}
                />
              </div>
              <div className="flex p-4 transition duration-200 hover:grayscale">
                <Image
                  // src={logo2}
                  src = "/assets/images/logos/8.png"
                  className="m-auto w-auto"
                  loading="lazy"
                  alt="logo"
                  width={190}
                  height={40}
                />
              </div>
              <div className="flex p-4 grayscale transition duration-200">
                <Image
                  // src={logo3}
                  src = "/assets/images/logos/2.png"
                  className="m-auto w-auto"
                  loading="lazy"
                  alt="logo"
                  width={80}
                  height={40}
                />
              </div>
            </div>
            <div className="mt-10 w-full">
              <div className="transition duration-200 hover:grayscale">
                <Image
                  // src={partners}
                  src = "/assets/images/logos/partner_bottom.png"
                  className="mx-auto w-auto"
                  loading="lazy"
                  alt="logo"
                  width={900}
                  height={40}
                />
              </div>
              {/* <div className="p-4 transition duration-200 hover:grayscale">
                <Image
                  src={logob2}
                  className="mx-auto w-auto"
                  loading="lazy"
                  alt="logo"
                  width={110}
                  height={40}
                />
              </div>
              <div className=" p-4 transition duration-200 hover:grayscale">
                <Image
                  src={logob3}
                  className="m-auto h-16 w-auto"
                  loading="lazy"
                  alt="logo"
                  width={130}
                  height={40}
                />
              </div>
              <div className=" p-4 transition duration-200 hover:grayscale">
                <Image
                  src={logob4}
                  className="m-auto w-auto"
                  loading="lazy"
                  alt="logo"
                  width={110}
                  height={40}
                />
              </div> */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
