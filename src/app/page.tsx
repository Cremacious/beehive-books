// import Link from 'next/link';
import { Button } from '@/components/ui/button';
import heroImage from '@/assets/site/beehive.png';
import beeWriting from '@/assets/site/beeWriting.png';
import beeShare from '@/assets/site/createBook.png';
import beeFriends from '@/assets/site/friends.png';
import beeJoin from '@/assets/site/signup.png';
import Image from 'next/image';

export default function Home() {
  return (
    <div>
      {/* Hero Section */}
      <div className="px-4 sm:px-10 pt-6 bg-[#202020] shadow-2xl ">
        <div className="max-w-7xl mx-auto">
          <div className="grid xl:grid-cols-2 justify-center items-center gap-5 md:mx-8 ">
            <div className="xl:aspect-[8/7] sm:aspect-[10/7] w-full">
              <Image
                src={heroImage}
                alt="banner img"
                className="object-contain w-3/4 h-3/4 mx-auto rounded-2xl mb-6"
                height={300}
                width={300}
                priority
              />
            </div>
            <div className="">
              <div className="max-w-3xl max-xl:mx-auto max-xl:text-center">
                <h1 className="lg:text-6xl md:text-5xl text-4xl text-yellow-400 font-semibold lg:!leading-[75px] md:!leading-[65px] leading-[55px]">
                  Get buzzing with writing!
                </h1>
                <p className="text-base leading-relaxed mt-6 text-white">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed
                  do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                  Ut enim ad minim veniam, quis nostrud exercitation ullamco
                  laboris nisi ut aliquip ex ea commodo consequat. Duis aute
                  irure dolor in reprehenderit in voluptate velit esse cillum
                  dolore eu fugiat nulla pariatur. Excepteur sint occaecat
                  cupidatat non proident, sunt in culpa qui officia deserunt
                  mollit anim id est laborum.
                </p>
              </div>
              <div className="mt-12 flex flex-wrap gap-x-6 gap-y-4 max-xl:justify-center">
                <Button size={'lg'}>Get Started</Button>
                <Button size={'lg'} variant={'secondary'}>
                  Sign In
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div id="features" className="px-4 sm:px-10 md:mt-28 mt-20 ">
        <div className="max-w-screen-xl mx-auto max-lg:max-w-xl bg-[#202020] py-8 px-4 md:px-6 rounded-2xl shadow-2xl">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-yellow-400 lg:text-4xl sm:text-3xl text-2xl font-semibold mb-6 md:!leading-[50px] leading-[40px]">
              orem ipsum dolor sit amet
            </h2>
            <p className="text-white  leading-relaxed">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
              eiusmod tempor incididunt ut labore et dolore magna
            </p>
          </div>
          <div className="grid lg:grid-cols-2 items-center gap-x-12 gap-y-8 mt-16">
            <div className="aspect-[7/4]">
              <Image
                src={beeWriting}
                alt="analytics-img"
                className="w-full h-full object-contain"
                priority
              />
            </div>
            <div className="max-w-lg max-lg:text-center max-lg:mx-auto">
              <h3 className="text-xl font-semibold mb-6 text-yellow-400">
                Create Books With Ease
              </h3>
              <p className="text-base text-white  leading-relaxed">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
                eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut
                enim ad minim veniam, quis nostrud exercitation ullamco laboris
                nisi ut aliquip ex ea commodo consequat. Smart Assistant doesn’t
                just process words—it understands meaning, context, and nuance
                like a human. Our state-of-the-art NLP engine goes beyond
                keyword matching to deliver truly intelligent interactions,
                making every conversation.
              </p>
            </div>
          </div>
          <div className="grid lg:grid-cols-2 items-center gap-x-1 gap-y-8 mt-16 md:mx-8 ">
            <div className="max-w-lg max-lg:text-center max-lg:mx-auto">
              <h3 className="text-xl font-semibold mb-6 text-yellow-400">
                Get Feedback From Friends
              </h3>
              <p className="text-white  leading-relaxed">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
                eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut
                enim ad minim veniam, quis nostrud exercitation ullamco laboris
                nisi ut aliquip ex ea commodo consequat.
              </p>
            </div>
            <div className="aspect-[7/4] max-lg:-order-1">
              <Image
                src={beeFriends}
                alt="analytics-img"
                className="w-full h-full object-contain"
                priority
              />
            </div>
          </div>
          <div className="grid lg:grid-cols-2 items-center gap-x-12 gap-y-8 mt-16">
            <div className="aspect-[7/4]">
              <Image
                src={beeShare}
                alt="analytics-img"
                className="w-full h-full object-contain"
                priority
              />
            </div>
            <div className="max-w-lg max-lg:text-center max-lg:mx-auto">
              <h3 className="text-xl font-semibold mb-6 text-yellow-400">
                Share Your Work With The World
              </h3>
              <p className="text-base text-white leading-relaxed">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
                eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut
                enim ad minim veniam, quis nostrud exercitation ullamco laboris
                nisi ut aliquip ex ea commodo consequat.
              </p>
            </div>
          </div>
        </div>
      </div>
      {/* Advanced AI Section */}
      <div id="advanced-ai" className="px-4 sm:px-10 md:mt-28 mt-20">
        <div className="max-w-screen-xl mx-auto">
          <div className="bg-[#202020] px-6 sm:px-12 py-16 rounded-3xl">
            <div className="grid lg:grid-cols-2 items-center gap-12">
              <div className="max-w-xl max-lg:mx-auto">
                <div className="max-lg:text-center">
                  <h2 className="text-yellow-400 lg:text-4xl sm:text-3xl text-2xl font-semibold mb-6 md:!leading-[50px] leading-[40px]">
                    Lorem ipsum dolor sit amet
                  </h2>
                  <p className="text-white leading-relaxed">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed
                    do eiusmod tempor incididunt ut labore et dolore magna
                    aliqua. Ut enim ad minim veniam
                  </p>
                </div>
                <ul className="space-y-4 mt-8">
                  <li className="flex items-start text-white">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width={18}
                      className="mr-3 bg-yellow-600 fill-white rounded-full p-[3px] shrink-0"
                      viewBox="0 0 24 24"
                    >
                      <path
                        d="M9.707 19.121a.997.997 0 0 1-1.414 0l-5.646-5.647a1.5 1.5 0 0 1 0-2.121l.707-.707a1.5 1.5 0 0 1 2.121 0L9 14.171l9.525-9.525a1.5 1.5 0 0 1 2.121 0l.707.707a1.5 1.5 0 0 1 0 2.121z"
                        data-original="#000000"
                      />
                    </svg>
                    <span>
                      Lorem ipsum dolor sit amet, consectetur adipiscing elit,
                    </span>
                  </li>
                  <li className="flex items-start text-white">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width={18}
                      className="mr-3 bg-yellow-600 fill-white rounded-full p-[3px] shrink-0"
                      viewBox="0 0 24 24"
                    >
                      <path
                        d="M9.707 19.121a.997.997 0 0 1-1.414 0l-5.646-5.647a1.5 1.5 0 0 1 0-2.121l.707-.707a1.5 1.5 0 0 1 2.121 0L9 14.171l9.525-9.525a1.5 1.5 0 0 1 2.121 0l.707.707a1.5 1.5 0 0 1 0 2.121z"
                        data-original="#000000"
                      />
                    </svg>
                    <span>
                      Lorem ipsum dolor sit amet, consectetur adipiscing elit,
                    </span>
                  </li>
                  <li className="flex items-start text-white">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width={18}
                      className="mr-3 bg-yellow-600 fill-white rounded-full p-[3px] shrink-0"
                      viewBox="0 0 24 24"
                    >
                      <path
                        d="M9.707 19.121a.997.997 0 0 1-1.414 0l-5.646-5.647a1.5 1.5 0 0 1 0-2.121l.707-.707a1.5 1.5 0 0 1 2.121 0L9 14.171l9.525-9.525a1.5 1.5 0 0 1 2.121 0l.707.707a1.5 1.5 0 0 1 0 2.121z"
                        data-original="#000000"
                      />
                    </svg>
                    <span>
                      Lorem ipsum dolor sit amet, consectetur adipiscing elit,
                    </span>
                  </li>
                </ul>
                <div className="mt-8">
                  <Button>Get Started</Button>
                </div>
              </div>
              <div className="aspect-[6/5] max-lg:max-w-xl max-lg:mx-auto max-lg:-order-1">
                <Image
                  src={beeJoin}
                  alt="analytics-img"
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
