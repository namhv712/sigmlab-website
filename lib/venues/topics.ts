export const TOPIC_VOCABULARY = [
  'computer-vision', 'deep-learning', 'machine-learning', 'pattern-recognition',
  'image-processing', 'multimedia', 'signal-processing',
  'object-detection', 'segmentation', 'tracking', 'classification',
  '3d-vision', 'scene-understanding', 'generative-models', 'vision-language',
  'medical-imaging', 'remote-sensing', 'biometrics', 'document-analysis',
  'robotics', 'autonomous-driving', 'agriculture', 'surveillance',
  'nlp-multimodal', 'graphics', 'ar-vr', 'video-analysis',
  'low-level-vision', 'face-recognition', 'human-pose', 'action-recognition',
  'data-mining', 'information-retrieval', 'knowledge-engineering',
] as const

export type Topic = typeof TOPIC_VOCABULARY[number]

export const TOPIC_LABELS: Record<string, string> = {
  'computer-vision': 'Computer Vision',
  'deep-learning': 'Deep Learning',
  'machine-learning': 'Machine Learning',
  'pattern-recognition': 'Pattern Recognition',
  'image-processing': 'Image Processing',
  'multimedia': 'Multimedia',
  'signal-processing': 'Signal Processing',
  'object-detection': 'Object Detection',
  'segmentation': 'Segmentation',
  'tracking': 'Tracking',
  'classification': 'Classification',
  '3d-vision': '3D Vision',
  'scene-understanding': 'Scene Understanding',
  'generative-models': 'Generative Models',
  'vision-language': 'Vision\u2013Language',
  'medical-imaging': 'Medical Imaging',
  'remote-sensing': 'Remote Sensing',
  'biometrics': 'Biometrics',
  'document-analysis': 'Document Analysis',
  'robotics': 'Robotics',
  'autonomous-driving': 'Autonomous Driving',
  'agriculture': 'Agriculture',
  'surveillance': 'Surveillance',
  'nlp-multimodal': 'NLP / Multimodal',
  'graphics': 'Graphics',
  'ar-vr': 'AR / VR',
  'video-analysis': 'Video Analysis',
  'low-level-vision': 'Low-level Vision',
  'face-recognition': 'Face Recognition',
  'human-pose': 'Human Pose',
  'action-recognition': 'Action Recognition',
  'data-mining': 'Data Mining',
  'information-retrieval': 'Information Retrieval',
  'knowledge-engineering': 'Knowledge Engineering',
}

export function topicLabel(topic: string): string {
  return TOPIC_LABELS[topic] ?? topic
}
