interface VisionResponse {
    responses: [
        {
            textAnnotations: [{
                description: string
            }]
        }
    ]
}

export async function annotateImage(encodedImage: string): Promise<VisionResponse> {
    const base64Image = encodedImage.split(',')[1]
    return await fetch('https://vision.googleapis.com/v1/images:annotate?key=API-KEY', {
        method: 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(
            {
                "requests": [
                    {
                        "image": {
                            "content": base64Image
                        },
                        "features": [
                            {
                                "type": "TEXT_DETECTION"
                            }
                        ]
                    }
                ]
            }
        )
    }).then((result) => {
        return result.json() as unknown as VisionResponse
    })
}
