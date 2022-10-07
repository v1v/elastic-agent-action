configure:
	yarn install

test:
	docker buildx bake test

build:
	docker buildx bake pre-checkin

validate:
	docker buildx bake validate
