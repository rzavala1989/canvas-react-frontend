import React from "react"
import { ReactI18NextChild } from "react-i18next"
import { BallTriangle } from "react-loader-spinner"


export const LoadingSpinner = () => {

  return (
    <div className="loading-spinner">
      <BallTriangle
        height={100}
        width={100}
        radius={5}
        color="#4fd1c5"
        ariaLabel="ball-triangle-loading"
        wrapperStyle={{}}
        wrapperClass=""
        visible={true}
      />
    </div>
  )
}