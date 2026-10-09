from setuptools import find_packages, setup

package_name = 'software_estop'

setup(
    name=package_name,
    version='0.0.0',
    packages=find_packages(exclude=['test']),
    data_files=[
        ('share/ament_index/resource_index/packages',
            ['resource/' + package_name]),
        ('share/' + package_name, ['package.xml']),
    ],
    install_requires=['setuptools'],
    zip_safe=True,
    maintainer='Raylen',
    maintainer_email='supernova12888@gmail.com',
    description='Emergency stop service thingy.',
    license='Apache-2.0',
    extras_require={
        'test': [
            'pytest',
        ],
    },
    entry_points={
        'console_scripts': [
            'service = software_estop.estop_robot:main'
        ],
    },
)
