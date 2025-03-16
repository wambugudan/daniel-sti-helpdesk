import React from 'react'

const DataCard = ({workRequest}) => {
    // username= "John Kamau",
    // title="Demo Title",
    // budget= "$100",
    // description= "This is a sample description to showcase how the card will look when there is no data.",
    // category="Web Development"

    return (
    <div className="bg-white shadow-lg rounded-lg p-4 w-full sm:w-3/4 md:w-4/5 lg:w-4/5 xl:w-2/3 mx-auto transition-transform duration-300 hover:scale-105 hover:shadow-lg">
        {/* Display username */}
        <h4 className='text-sm font-semibold text-gray-700 mt-1'>{workRequest.userId}</h4>
        
        {/* Task Title */}
        <h3 className='text-lg font-bold text-gray-900'>{workRequest.title}</h3>
        
        {/* Display Budget */}
        <h3 className='text-sm text-gray-500 mt-1'>Budget: <span className='font-medium text-green-600'>{workRequest.budget}</span></h3>

        {/* Description preview the first 50 words */}
        <p className='text-sm text-gray-600 mt-2'>
            {workRequest.description.split(" ").slice(0, 50).join(" ")}...
        </p>

        {/* Display Task Category Button */}
        <button className='mt-3 px-3 py-1 text-xs font-medium bg-teal-100 text-teal-700 rounded-full'>
            {workRequest.category}
        </button>
    </div>
  )
}

export default DataCard