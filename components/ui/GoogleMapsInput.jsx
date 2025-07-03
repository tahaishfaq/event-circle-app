// "use client"

// import { useState, useEffect, useRef } from "react"
// import { Input } from "@/components/ui/input"
// import { Button } from "@/components/ui/button"
// import { Card, CardContent } from "@/components/ui/card"
// import { MapPin, X } from "lucide-react"

// export default function GoogleMapsInput({ value, onChange, placeholder = "Enter location..." }) {
//   const [inputValue, setInputValue] = useState(value || "")
//   const [predictions, setPredictions] = useState([])
//   const [showPredictions, setShowPredictions] = useState(false)
//   const [selectedPlace, setSelectedPlace] = useState(null)
//   const inputRef = useRef(null)
//   const autocompleteService = useRef(null)
//   const placesService = useRef(null)

//   useEffect(() => {
//     // Initialize Google Maps Services
//     if (window.google && window.google.maps) {
//       autocompleteService.current = new window.google.maps.places.AutocompleteService()
//       // Initialize PlacesService with a DOM element (required)
//       placesService.current = new window.google.maps.places.PlacesService(document.createElement('div'))
//     } else {
//       // Load Google Maps API if not already loaded
//       loadGoogleMapsAPI()
//     }
//   }, [])

//   useEffect(() => {
//     setInputValue(value || "")
//   }, [value])

//   const loadGoogleMapsAPI = () => {
//     if (!window.google) {
//       const script = document.createElement("script")
//       script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`
//       script.async = true
//       script.defer = true
//       script.onload = () => {
//         autocompleteService.current = new window.google.maps.places.AutocompleteService()
//         placesService.current = new window.google.maps.places.PlacesService(document.createElement('div'))
//       }
//       document.head.appendChild(script)
//     }
//   }

//   const handleInputChange = (e) => {
//     const newValue = e.target.value
//     setInputValue(newValue)

//     if (newValue.length > 2 && autocompleteService.current) {
//       autocompleteService.current.getPlacePredictions(
//         {
//           input: newValue,
//           types: ["(cities)"],
//         },
//         (predictions, status) => {
//           if (status === window.google.maps.places.PlacesServiceStatus.OK && predictions) {
//             setPredictions(predictions)
//             setShowPredictions(true)
//           } else {
//             setPredictions([])
//             setShowPredictions(false)
//           }
//         },
//       )
//     } else {
//       setPredictions([])
//       setShowPredictions(false)
//     }
//   }

//   const handlePlaceSelect = (prediction) => {
//     setInputValue(prediction.description)
//     setShowPredictions(false)

//     if (window.google && window.google.maps && placesService.current) {
//       placesService.current.getDetails(
//         {
//           placeId: prediction.place_id,
//           fields: ["name", "formatted_address", "geometry.location", "place_id"],
//         },
//         (place, status) => {
//           if (status === window.google.maps.places.PlacesServiceStatus.OK && place) {
//             const locationData = {
//               address: place.formatted_address || prediction.description,
//               name: place.name || prediction.structured_formatting.main_text,
//               placeId: place.place_id,
//               coordinates: {
//                 lat: place.geometry.location.lat(),
//                 lng: place.geometry.location.lng(),
//               },
//             }
//             setSelectedPlace(locationData)
//             onChange(locationData.address, locationData)
//           } else {
//             console.error("Error fetching place details:", status)
//             onChange(prediction.description, { address: prediction.description })
//           }
//         }
//       )
//     } else {
//       console.error("Google Maps API not loaded")
//       onChange(prediction.description, { address: prediction.description })
//     }
//   }

//   const handleClearLocation = () => {
//     setInputValue("")
//     setSelectedPlace(null)
//     setPredictions([])
//     setShowPredictions(false)
//     onChange("", null)
//   }

//   const handleInputFocus = () => {
//     if (predictions.length > 0) {
//       setShowPredictions(true)
//     }
//   }

//   const handleInputBlur = () => {
//     setTimeout(() => {
//       setShowPredictions(false)
//     }, 200)
//   }

//   return (
//     <div className="relative">
//       <div className="relative">
//         <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
//         <Input
//           ref={inputRef}
//           type="text"
//           value={inputValue}
//           onChange={handleInputChange}
//           onFocus={handleInputFocus}
//           onBlur={handleInputBlur}
//           placeholder={placeholder}
//           className="pl-10 pr-10"
//         />
//         {inputValue && (
//           <Button
//             type="button"
//             variant="ghost"
//             size="sm"
//             className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
//             onClick={handleClearLocation}
//           >
//             <X className="h-4 w-4" />
//           </Button>
//         )}
//       </div>

//       {showPredictions && predictions.length > 0 && (
//         <Card className="absolute top-full left-0 right-0 z-50 mt-1 max-h-60 overflow-y-auto">
//           <CardContent className="p-0">
//             {predictions.map((prediction) => (
//               <div
//                 key={prediction.place_id}
//                 className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
//                 onClick={() => handlePlaceSelect(prediction)}
//               >
//                 <div className="flex items-start space-x-3">
//                   <MapPin className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
//                   <div className="flex-1 min-w-0">
//                     <p className="text-sm font-medium text-gray-900 truncate">
//                       {prediction.structured_formatting.main_text}
//                     </p>
//                     <p className="text-sm text-gray-500 truncate">{prediction.structured_formatting.secondary_text}</p>
//                   </div>
//                 </div>
//               </div>
//             ))}
//           </CardContent>
//         </Card>
//       )}

//       {selectedPlace && (
//         <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-md">
//           <div className="flex items-center space-x-2">
//             <MapPin className="h-4 w-4 text-green-600" />
//             <div className="flex-1">
//               <p className="text-sm font-medium text-green-800">{selectedPlace.name}</p>
//               <p className="text-xs text-green-600">{selectedPlace.address}</p>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   )
// }


"use client"

import { useState, useEffect, useRef } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { MapPin, X } from "lucide-react"

export default function GoogleMapsInput({ value, onChange, placeholder = "Enter location..." }) {
  const [inputValue, setInputValue] = useState(value || "")
  const [predictions, setPredictions] = useState([])
  const [showPredictions, setShowPredictions] = useState(false)
  const [selectedPlace, setSelectedPlace] = useState(null)
  const inputRef = useRef(null)
  const autocompleteService = useRef(null)
  const placesService = useRef(null)

  useEffect(() => {
    // Initialize Google Maps Services
    if (window.google && window.google.maps) {
      autocompleteService.current = new window.google.maps.places.AutocompleteService()
      placesService.current = new window.google.maps.places.PlacesService(document.createElement('div'))
    } else {
      loadGoogleMapsAPI()
    }
  }, [])

  useEffect(() => {
    setInputValue(value || "")
  }, [value])

  const loadGoogleMapsAPI = () => {
    if (!window.google) {
      const script = document.createElement("script")
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`
      script.async = true
      script.defer = true
      script.onload = () => {
        autocompleteService.current = new window.google.maps.places.AutocompleteService()
        placesService.current = new window.google.maps.places.PlacesService(document.createElement('div'))
      }
      document.head.appendChild(script)
    }
  }

  const handleInputChange = (e) => {
    const newValue = e.target.value
    setInputValue(newValue)

    if (newValue.length > 2 && autocompleteService.current) {
      autocompleteService.current.getPlacePredictions(
        {
          input: newValue,
          componentRestrictions: { country: "za" }, // Restrict to South Africa
        },
        (predictions, status) => {
          if (status === window.google.maps.places.PlacesServiceStatus.OK && predictions) {
            setPredictions(predictions)
            setShowPredictions(true)
          } else {
            setPredictions([])
            setShowPredictions(false)
          }
        }
      )
    } else {
      setPredictions([])
      setShowPredictions(false)
    }
  }

  const handlePlaceSelect = (prediction) => {
    setInputValue(prediction.description)
    setShowPredictions(false)

    if (window.google && window.google.maps && placesService.current) {
      placesService.current.getDetails(
        {
          placeId: prediction.place_id,
          fields: ["name", "formatted_address", "geometry.location", "place_id", "address_components"],
        },
        (place, status) => {
          if (status === window.google.maps.places.PlacesServiceStatus.OK && place) {
            const locationData = {
              address: place.formatted_address || prediction.description,
              name: place.name || prediction.structured_formatting.main_text,
              placeId: place.place_id,
              coordinates: {
                lat: place.geometry.location.lat(),
                lng: place.geometry.location.lng(),
              },
              addressComponents: place.address_components || [], // Include address components if needed
            }
            setSelectedPlace(locationData)
            onChange(locationData.address, locationData)
          } else {
            console.error("Error fetching place details:", status)
            onChange(prediction.description, { address: prediction.description })
          }
        }
      )
    } else {
      console.error("Google Maps API not loaded")
      onChange(prediction.description, { address: prediction.description })
    }
  }

  const handleClearLocation = () => {
    setInputValue("")
    setSelectedPlace(null)
    setPredictions([])
    setShowPredictions(false)
    onChange("", null)
  }

  const handleInputFocus = () => {
    if (predictions.length > 0) {
      setShowPredictions(true)
    }
  }

  const handleInputBlur = () => {
    setTimeout(() => {
      setShowPredictions(false)
    }, 200)
  }

  return (
    <div className="relative">
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          placeholder={placeholder}
          className="pl-10 pr-10"
        />
        {inputValue && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
            onClick={handleClearLocation}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {showPredictions && predictions.length > 0 && (
        <Card className="absolute top-full left-0 right-0 z-50 mt-1 max-h-60 overflow-y-auto">
          <CardContent className="p-0">
            {predictions.map((prediction) => (
              <div
                key={prediction.place_id}
                className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                onClick={() => handlePlaceSelect(prediction)}
              >
                <div className="flex items-start space-x-3">
                  <MapPin className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {prediction.structured_formatting.main_text}
                    </p>
                    <p className="text-sm text-gray-500 truncate">{prediction.structured_formatting.secondary_text}</p>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {selectedPlace && (
        <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-md">
          <div className="flex items-center space-x-2">
            <MapPin className="h-4 w-4 text-green-600" />
            <div className="flex-1">
              <p className="text-sm font-medium text-green-800">{selectedPlace.name}</p>
              <p className="text-xs text-green-600">{selectedPlace.address}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}